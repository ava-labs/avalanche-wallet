import { Module } from 'vuex'
import {
    AddTokenListInput,
    AssetsDict,
    AssetsState,
    TokenList,
    TokenListToken,
} from '@/store/modules/assets/types'
import {
    IWalletAssetsDict,
    IWalletBalanceDict,
    IWalletNftDict,
    IWalletNftMintDict,
    RootState,
} from '@/store/types'
import { ava, bintools } from '@/AVA'
import Vue from 'vue'
import AvaAsset from '@/js/AvaAsset'
import { WalletType } from '@/js/wallets/types'
import { AvaNftFamily } from '@/js/AvaNftFamily'
import {
    AmountOutput,
    UTXOSet as AVMUTXOSet,
    UTXO,
    NFTMintOutput,
} from '@c4tplatform/camino/dist/apis/avm'
import { UnixNow } from '@c4tplatform/camino/dist/utils'
import { BN } from '@c4tplatform/camino'
import { UTXOSet as PlatformUTXOSet } from '@c4tplatform/camino/dist/apis/platformvm/utxos'
import { StakeableLockOut } from '@c4tplatform/camino/dist/apis/platformvm'
import axios from 'axios'
import Erc20Token from '@/js/Erc20Token'
import { AvaNetwork } from '@/js/AvaNetwork'
import { web3 } from '@/evm'
// import ERCNftToken from '@/js/ERCNftToken'

const TOKEN_LISTS: string[] = []

import ERCNftModule from './modules/ercNft'
import ERC20_TOKEN_LIST from '@/ERC20Tokenlist.json'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { getPayloadFromUTXO } from '@/helpers/helper'
import { isUrlBanned } from '@/components/misc/NftPayloadView/blacklist'

const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    modules: {
        ERCNft: ERCNftModule,
    },
    state: {
        AVA_ASSET_ID: null,
        // isUpdateBalance: false,
        assets: [],
        assetsDict: {}, // holds meta data of assets
        nftFams: [],
        nftFamsDict: {},
        balanceDict: {},
        nftUTXOs: [],
        nftMintUTXOs: [],
        erc20Tokens: [],
        erc20TokensCustom: [],
        evmChainId: 0,
        tokenLists: [],
        tokenListUrls: [],
        tokenListsCustom: [],
        nftWhitelist: [],
    },
    mutations: {
        addAsset(state, asset: AvaAsset) {
            if (state.assetsDict[asset.id]) {
                // console.info(`Failed to add asset. Asset already exists. (${asset.id})`)
                return
            }
            state.assets.push(asset)
            Vue.set(state.assetsDict, asset.id, asset)
        },
        addNftFamily(state, family: AvaNftFamily) {
            if (state.nftFamsDict[family.id]) {
                // console.info(`Failed to add NFT Family. Asset already exists. (${family.id})`)
                return
            }
            state.nftFams.push(family)
            Vue.set(state.nftFamsDict, family.id, family)
        },
        removeAllAssets(state) {
            state.assets = []
            state.assetsDict = {}
            state.nftFams = []
            state.nftFamsDict = {}
            state.nftUTXOs = []
            state.nftMintUTXOs = []
            state.balanceDict = {}
            state.AVA_ASSET_ID = null
        },
        saveCustomErc20Tokens(state) {
            let tokens: Erc20Token[] = state.erc20TokensCustom

            let tokenRawData: TokenListToken[] = tokens.map((token) => {
                return token.data
            })
            localStorage.setItem('erc20_tokens', JSON.stringify(tokenRawData))
        },
        loadCustomErc20Tokens(state) {
            let tokensRaw = localStorage.getItem('erc20_tokens') || '[]'
            let tokens: TokenListToken[] = JSON.parse(tokensRaw)
            for (var i = 0; i < tokens.length; i++) {
                state.erc20TokensCustom.push(new Erc20Token(tokens[i]))
            }
        },

        saveCustomTokenLists(state) {
            let lists = JSON.stringify(state.tokenListsCustom)
            localStorage.setItem('token_lists', lists)
        },

        whitelistNFT(state, id: string) {
            state.nftWhitelist.push(id)
        },
    },
    actions: {
        async onNetworkChange({ state }, network: AvaNetwork) {
            let id = await web3.eth.getChainId()
            state.evmChainId = id
        },
        // Called everytime a new wallet is selected
        updateWallet({ dispatch }) {
            dispatch('ERCNft/updateUserNfts')
            dispatch('ERCNft/scanNewNfts')
        },
        // Called on a logout event
        onLogout({ state, commit }) {
            // state.isUpdateBalance = false
            commit('removeAllAssets')
        },

        // Called when the active wallet finishes fetching utxos
        async onUtxosUpdated({ state, dispatch, rootState }) {
            let wallet: WalletType | null = rootState.activeWallet
            if (!wallet) return

            if (wallet.isFetchUtxos) {
                setTimeout(() => {
                    dispatch('onUtxosUpdated')
                }, 500)
                return
            }

            await dispatch('updateBalanceDict')
            await dispatch('updateUtxoArrays')
            await dispatch('addUnknownAssets')
        },

        updateUtxoArrays({ state, rootState, getters }) {
            let utxoSet = getters.walletAvmUtxoSet
            if (utxoSet === null) return {}

            let utxos = utxoSet.getAllUTXOs()

            let nftUtxos = []
            let nftMintUtxos = []

            for (var n = 0; n < utxos.length; n++) {
                let utxo = utxos[n]
                let outId = utxo.getOutput().getOutputID()

                if (outId === 11) {
                    nftUtxos.push(utxo)
                } else if (outId === 10) {
                    nftMintUtxos.push(utxo)
                }
            }

            // Filter NFT utxos

            nftUtxos = nftUtxos.filter((utxo) => {
                const payload = getPayloadFromUTXO(utxo)
                const content = payload.getContent().toString()
                return !isUrlBanned(content)
            })

            state.nftUTXOs = nftUtxos
            state.nftMintUTXOs = nftMintUtxos
        },

        async addErc20Token({ state, rootState }, token: TokenListToken) {
            let tokens: Erc20Token[] = state.erc20TokensCustom.concat(state.erc20Tokens)

            // Make sure its not added before
            for (var i = 0; i < tokens.length; i++) {
                let t = tokens[i]
                if (token.address === t.data.address && token.chainId === t.data.chainId) {
                    return
                }
            }

            let t = new Erc20Token(token)
            state.erc20Tokens.push(t)
        },

        async addCustomErc20Token({ state, rootState, commit }, token: TokenListToken) {
            let tokens: Erc20Token[] = state.erc20TokensCustom.concat(state.erc20Tokens)

            // Make sure its not added before
            for (var i = 0; i < tokens.length; i++) {
                let t = tokens[i]
                if (token.address === t.data.address && token.chainId === t.data.chainId) {
                    return
                }
            }

            let t = new Erc20Token(token)
            // Save token state to storage
            state.erc20TokensCustom.push(t)

            let w = rootState.activeWallet
            if (w) {
                t.updateBalance(w.ethAddress)
            }

            commit('saveCustomErc20Tokens')

            return t
        },

        async removeTokenList({ state, commit }, list: TokenList) {
            // Remove token list object
            for (var i = 0; i <= state.tokenLists.length; i++) {
                let l = state.tokenLists[i]

                if (l.url === list.url) {
                    state.tokenLists.splice(i, 1)
                    break
                }
            }

            // Remove custom Token list urls
            let index = state.tokenListsCustom.indexOf(list.url)
            state.tokenListsCustom.splice(index, 1)

            // Update local storage
            commit('saveCustomTokenLists')
        },

        async addTokenListUrl({ dispatch, state, commit }, data: AddTokenListInput) {
            // Make sure URL is not already added
            if (state.tokenListUrls.includes(data.url)) throw 'Already added.'
            if (state.tokenListsCustom.includes(data.url)) throw 'Already added.'

            let url = data.url
            let res = await axios.get(url)
            let tokenList: TokenList = res.data
            tokenList.url = url
            tokenList.readonly = data.readonly

            dispatch('addTokenList', tokenList)
        },

        async addTokenList({ state, dispatch, commit }, tokenList: TokenList) {
            let tokens: TokenListToken[] = tokenList.tokens
            state.tokenLists.push(tokenList)
            for (var i = 0; i < tokens.length; i++) {
                dispatch('addErc20Token', tokens[i])
            }

            if (!tokenList.readonly) {
                state.tokenListsCustom.push(tokenList.url)
                commit('saveCustomTokenLists')
            } else {
                state.tokenListUrls.push(tokenList.url)
            }
        },

        loadCustomTokenLists({ state, dispatch }) {
            let listRaw = localStorage.getItem('token_lists')
            if (!listRaw) return
            let urls: string[] = JSON.parse(listRaw)

            urls.forEach((url) => {
                dispatch('addTokenListUrl', {
                    url: url,
                    readonly: false,
                })
            })
        },

        async initErc20List({ state, dispatch, commit }) {
            // Load default erc20 token contracts
            let erc20Tokens = ERC20_TOKEN_LIST as TokenList
            erc20Tokens.readonly = true
            erc20Tokens.url = 'Default'
            await dispatch('addTokenList', erc20Tokens)

            for (var i = 0; i < TOKEN_LISTS.length; i++) {
                await dispatch('addTokenListUrl', {
                    url: TOKEN_LISTS[i],
                    readonly: true,
                })
            }

            dispatch('loadCustomTokenLists')
            commit('loadCustomErc20Tokens')
        },

        // Gets the balances of the active wallet and gets descriptions for unknown asset ids
        addUnknownAssets({ state, getters, rootGetters, dispatch }) {
            let balanceDict: IWalletBalanceDict = state.balanceDict
            let nftDict: IWalletNftDict = getters.walletNftDict
            let nftMintDict: IWalletNftMintDict = getters.nftMintDict

            for (var id in balanceDict) {
                if (!state.assetsDict[id]) {
                    dispatch('addUnknownAsset', id)
                }
            }

            for (var nft_id in nftDict) {
                if (!state.nftFamsDict[nft_id]) {
                    dispatch('addUnknownNftFamily', nft_id)
                }
            }

            for (var familyId in nftMintDict) {
                if (!state.nftFamsDict[familyId]) {
                    dispatch('addUnknownNftFamily', familyId)
                }
            }
        },

        // Update the utxos for the current active wallet
        async updateUTXOs({ state, commit, dispatch, rootState }) {
            let wallet = rootState.activeWallet
            if (!wallet) {
                return false
            }

            await wallet.getUTXOs()
            dispatch('onUtxosUpdated')
            dispatch('updateERC20Balances')
            dispatch('ERCNft/scanNewNfts')
            dispatch('ERCNft/updateWalletBalance')
            commit('updateActiveAddress', null, { root: true })
        },

        // Only updates external utxos of the wallet
        async updateUTXOsExternal({ commit, dispatch, rootState }) {
            let wallet = rootState.activeWallet
            if (!wallet) {
                return false
            }

            if (wallet.type === 'ledger' || wallet.type === 'mnemonic') {
                await (wallet as MnemonicWallet | LedgerWallet).updateUTXOsExternal()
            } else {
                await wallet.updateUTXOsX()
            }

            dispatch('onUtxosUpdated')
            commit('updateActiveAddress', null, { root: true })
        },

        async updateERC20Balances({ state, rootState, getters }) {
            let wallet: WalletType | null = rootState.activeWallet
            if (!wallet) return
            // Old ledger wallets do not have an eth address
            if (!wallet.ethAddress) return

            let networkID = state.evmChainId
            let tokens: Erc20Token[] = getters.networkErc20Tokens
            tokens.forEach((token) => {
                if (token.data.chainId !== networkID) return
                token.updateBalance(wallet!.ethAddress)
            })
        },

        // What is the AVA coin in the network
        async updateAvaAsset({ state, commit }) {
            let res = await ava.XChain().getAssetDescription(ava.getPrimaryAssetAlias())
            let id = bintools.cb58Encode(res.assetID)
            state.AVA_ASSET_ID = id
            let asset = new AvaAsset(id, res.name, res.symbol, res.denomination)
            commit('addAsset', asset)
        },

        updateBalanceDict({ state, rootState, getters }): IWalletBalanceDict {
            let utxoSet = getters.walletAvmUtxoSet
            if (utxoSet === null) return {}

            let dict: IWalletBalanceDict = {}

            let unixNox = UnixNow()
            const ZERO = new BN(0)

            let addrUtxos = utxoSet.getAllUTXOs()

            for (var n = 0; n < addrUtxos.length; n++) {
                let utxo = addrUtxos[n]

                // Process only SECP256K1 Transfer Output utxos, outputid === 07
                let outId = utxo.getOutput().getOutputID()

                if (outId !== 7) continue

                let utxoOut = utxo.getOutput() as AmountOutput

                let locktime = utxoOut.getLocktime()
                let amount = utxoOut.getAmount()
                let assetIdBuff = utxo.getAssetID()
                let assetId = bintools.cb58Encode(assetIdBuff)

                // if not locked
                if (locktime.lte(unixNox)) {
                    if (!dict[assetId]) {
                        dict[assetId] = {
                            locked: ZERO,
                            available: amount.clone(),
                        }
                    } else {
                        let amt = dict[assetId].available
                        dict[assetId].available = amt.add(amount)
                    }
                } else {
                    // If locked
                    if (!dict[assetId]) {
                        dict[assetId] = {
                            locked: amount.clone(),
                            available: ZERO,
                        }
                    } else {
                        let amt = dict[assetId].locked
                        dict[assetId].locked = amt.add(amount)
                    }
                }
            }
            state.balanceDict = dict
            return dict
        },

        // Adds an unknown asset id to the assets dictionary
        async addUnknownAsset({ state, commit }, assetId: string) {
            // get info about the asset
            let desc = await ava.XChain().getAssetDescription(assetId)
            let newAsset = new AvaAsset(assetId, desc.name, desc.symbol, desc.denomination)

            await commit('addAsset', newAsset)
            return desc
        },

        async addUnknownNftFamily({ state, commit }, assetId: string) {
            let desc = await ava.XChain().getAssetDescription(assetId)
            let newFam = new AvaNftFamily(assetId, desc.name, desc.symbol)

            await commit('addNftFamily', newFam)
            return desc
        },
    },
    getters: {
        networkErc20Tokens(state: AssetsState, getters, rootState: RootState): Erc20Token[] {
            let tokens = state.erc20Tokens.concat(state.erc20TokensCustom)
            let chainId = state.evmChainId

            let filt = tokens.filter((t) => {
                if (t.data.chainId !== chainId) return false
                return true
            })
            return filt
        },

        findErc20: (state) => (contractAddr: string) => {
            let tokens: Erc20Token[] = state.erc20Tokens.concat(state.erc20TokensCustom)
            for (var i = 0; i < tokens.length; i++) {
                let t = tokens[i]
                if (t.data.address === contractAddr) {
                    return t
                }
            }
            return null
        },

        // assset id -> utxos
        walletNftDict(state, getters, rootState) {
            let utxos = state.nftUTXOs
            let res: IWalletNftDict = {}

            for (var i = 0; i < utxos.length; i++) {
                let utxo = utxos[i]
                let assetIdBuff = utxo.getAssetID()
                // TODO: Encoding might be taking too much time
                let assetId = bintools.cb58Encode(assetIdBuff)

                if (res[assetId]) {
                    res[assetId].push(utxo)
                } else {
                    res[assetId] = [utxo]
                }
            }
            return res
        },

        walletAssetsDict(state, getters, rootState, rootGetters): IWalletAssetsDict {
            // let balanceDict: IWalletBalanceDict = getters.walletBalanceDict
            //@ts-ignore
            let balanceDict: IWalletBalanceDict = state.balanceDict
            // @ts-ignore
            let assetsDict: AssetsDict = state.assetsDict
            let res: IWalletAssetsDict = {}

            for (var assetId in assetsDict) {
                let balanceAmt = balanceDict[assetId]

                let asset: AvaAsset
                if (!balanceAmt) {
                    asset = assetsDict[assetId]
                    asset.resetBalance()
                } else {
                    asset = assetsDict[assetId]
                    asset.resetBalance()
                    asset.addBalance(balanceAmt.available)
                    asset.addBalanceLocked(balanceAmt.locked)
                }

                // Add extras for Native token
                // @ts-ignore
                if (asset.id === state.AVA_ASSET_ID) {
                    asset.addExtra(getters.walletStakingBalance)
                    asset.addExtra(getters.walletPlatformBalance)
                    asset.addExtra(getters.walletPlatformBalanceLocked)
                    asset.addExtra(getters.walletPlatformBalanceLockedStakeable)
                }

                res[assetId] = asset
            }
            return res
        },

        walletAssetsArray(state, getters): AvaAsset[] {
            // let assetsDict: IWalletAssetsDict = getters.walletAssetsDict
            let assetsDict: IWalletAssetsDict = getters.walletAssetsDict
            let res: AvaAsset[] = []

            for (var id in assetsDict) {
                let asset = assetsDict[id]
                res.push(asset)
            }
            return res
        },

        walletAvmUtxoSet(state, getters, rootState): AVMUTXOSet | null {
            let wallet = rootState.activeWallet
            if (!wallet) return null
            return wallet.utxoset
        },

        nftFamilies(state): AvaNftFamily[] {
            return state.nftFams
        },

        walletStakingBalance(state, getters, rootState, rootGetters): BN {
            let wallet = rootState.activeWallet
            if (!wallet) return new BN(0)

            return wallet.stakeAmount
        },

        walletPlatformBalance(state, getters, rootState): BN {
            let wallet = rootState.activeWallet
            if (!wallet) return new BN(0)

            let utxoSet: PlatformUTXOSet

            utxoSet = wallet.getPlatformUTXOSet()

            let now = UnixNow()

            // The only type of asset is Native on the P chain
            let amt = new BN('0')

            let utxos = utxoSet.getAllUTXOs()
            for (var n = 0; n < utxos.length; n++) {
                let utxo = utxos[n]
                let utxoOut = utxo.getOutput()
                let outId = utxoOut.getOutputID()

                let locktime
                if (outId === 22) {
                    locktime = (utxoOut as StakeableLockOut).getStakeableLocktime()
                } else {
                    locktime = (utxoOut as AmountOutput).getLocktime()
                }

                // Filter out locked tokens and stakeable locked tokens
                if (locktime.lte(now)) {
                    amt.iadd((utxoOut as AmountOutput).getAmount())
                }
            }

            return amt
        },

        walletPlatformBalanceLocked(state, getters, rootState): BN {
            let wallet = rootState.activeWallet
            if (!wallet) return new BN(0)

            let utxoSet: PlatformUTXOSet

            utxoSet = wallet.getPlatformUTXOSet()

            let now = UnixNow()

            // The only type of asset is native token on the P chain
            let amt = new BN(0)

            let utxos = utxoSet.getAllUTXOs()
            for (var n = 0; n < utxos.length; n++) {
                let utxo = utxos[n]
                let utxoOut = utxo.getOutput() as AmountOutput
                let locktime = utxoOut.getLocktime()

                // Filter unlocked tokens
                if (locktime.gt(now)) {
                    amt.iadd(utxoOut.getAmount())
                }
            }

            return amt
        },

        walletPlatformBalanceLockedStakeable(state, getters, rootState): BN {
            let wallet = rootState.activeWallet
            if (!wallet) return new BN(0)

            let utxoSet: PlatformUTXOSet

            utxoSet = wallet.getPlatformUTXOSet()

            // The only type of asset is native token on the P chain
            let amt = new BN(0)
            let unixNow = UnixNow()

            let utxos = utxoSet.getAllUTXOs()
            for (var n = 0; n < utxos.length; n++) {
                let utxo = utxos[n]
                let utxoOut = utxo.getOutput() as StakeableLockOut
                let outType = utxoOut.getOutputID()

                // Type ID 22 is stakeable but locked tokens
                if (outType === 22) {
                    let locktime = utxoOut.getStakeableLocktime()
                    // Make sure the locktime is in the future
                    if (locktime.gt(unixNow)) {
                        amt.iadd(utxoOut.getAmount())
                    }
                }
            }

            return amt
        },

        nftMintDict(state): IWalletNftMintDict {
            let res: IWalletNftMintDict = {}
            let mintUTXOs = state.nftMintUTXOs

            for (var i = 0; i < mintUTXOs.length; i++) {
                let utxo: UTXO = mintUTXOs[i]
                let assetId = bintools.cb58Encode(utxo.getAssetID())

                let target = res[assetId]
                if (target) {
                    target.push(utxo)
                } else {
                    res[assetId] = [utxo]
                }
            }

            // sort by groupID
            for (var id in res) {
                res[id].sort((a, b) => {
                    let idA = (a.getOutput() as NFTMintOutput).getGroupID()
                    let idB = (b.getOutput() as NFTMintOutput).getGroupID()

                    return idA - idB
                })
            }
            return res
        },

        assetIds(state): string[] {
            return state.assets.map((asset) => {
                return asset.id
            })
        },
        AssetAVA(state, getters, rootState, rootGetters): AvaAsset | null {
            let walletBalanceDict = getters.walletAssetsDict
            let AVA_ASSET_ID = state.AVA_ASSET_ID
            if (AVA_ASSET_ID) {
                if (walletBalanceDict[AVA_ASSET_ID]) {
                    return walletBalanceDict[AVA_ASSET_ID]
                }
            }
            return null
        },
    },
}

export default assets_module
