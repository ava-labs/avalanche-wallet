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
import { ava, avm, bintools, cChain } from '@/AVA'
import Vue from 'vue'
import AvaAsset from '@/js/AvaAsset'
import { WalletType } from '@/js/wallets/types'
import { AvaNftFamily } from '@/js/AvaNftFamily'
import { AmountOutput, UTXOSet as AVMUTXOSet, UTXO, NFTMintOutput } from 'avalanche/dist/apis/avm'
import { UnixNow } from 'avalanche/dist/utils'
import { BN } from 'avalanche'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm/utxos'
import { PlatformVMConstants, StakeableLockOut } from 'avalanche/dist/apis/platformvm'
import axios from 'axios'
import Erc20Token from '@/js/Erc20Token'
import { AvaNetwork } from '@/js/AvaNetwork'
import { web3 } from '@/evm'

const TOKEN_LISTS: string[] = []

import ERC721Module from './modules/erc721'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { getPayloadFromUTXO } from '@/helpers/helper'
import { isUrlBanned } from '@/components/misc/NftPayloadView/blacklist'
import { fetchTokenList } from '@/store/modules/assets/fetchTokenList'

const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    modules: {
        ERC721: ERC721Module,
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
                return
            }
            state.assets.push(asset)
            Vue.set(state.assetsDict, asset.id, asset)
        },
        addNftFamily(state, family: AvaNftFamily) {
            if (state.nftFamsDict[family.id]) {
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
            const tokens: Erc20Token[] = state.erc20TokensCustom

            const tokenRawData: TokenListToken[] = tokens.map((token) => {
                return token.data
            })
            localStorage.setItem('erc20_tokens', JSON.stringify(tokenRawData))
        },
        loadCustomErc20Tokens(state) {
            const tokensRaw = localStorage.getItem('erc20_tokens') || '[]'
            const tokens: TokenListToken[] = JSON.parse(tokensRaw)
            for (let i = 0; i < tokens.length; i++) {
                state.erc20TokensCustom.push(new Erc20Token(tokens[i]))
            }
        },

        saveCustomTokenLists(state) {
            const lists = JSON.stringify(state.tokenListsCustom)
            localStorage.setItem('token_lists', lists)
        },

        whitelistNFT(state, id: string) {
            state.nftWhitelist.push(id)
        },
    },
    actions: {
        async onNetworkChange({ state }, network: AvaNetwork) {
            const id = await web3.eth.getChainId()
            state.evmChainId = id
        },
        // Called on a logout event
        onLogout({ state, commit }) {
            // state.isUpdateBalance = false
            commit('removeAllAssets')
        },

        // Called when the active wallet finishes fetching utxos
        async onUtxosUpdated({ state, dispatch, rootState }) {
            const wallet: WalletType | null = rootState.activeWallet
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

        /**
         * Updates X-Chain NFT utxos in 2 categories, nftUTXOs
         * and nftMintUTXOs
         */
        updateUtxoArrays({ state, rootState, getters }) {
            const utxoSet = getters.walletAvmUtxoSet
            if (utxoSet === null) return {}

            const utxos = utxoSet.getAllUTXOs()

            let nftUtxos = []
            const nftMintUtxos = []

            for (let n = 0; n < utxos.length; n++) {
                const utxo = utxos[n]
                const outId = utxo.getOutput().getOutputID()

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
            const tokens: Erc20Token[] = state.erc20TokensCustom.concat(state.erc20Tokens)

            // Make sure its not added before
            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i]
                if (token.address === t.data.address && token.chainId === t.data.chainId) {
                    console.log('ERC20 Token already added.')
                    return
                }
            }

            const t = new Erc20Token(token)
            state.erc20Tokens.push(t)
        },

        async addCustomErc20Token({ state, rootState, commit }, token: TokenListToken) {
            const tokens: Erc20Token[] = state.erc20TokensCustom.concat(state.erc20Tokens)

            // Make sure its not added before
            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i]
                if (token.address === t.data.address && token.chainId === t.data.chainId) {
                    console.log('ERC20 Token already added.')
                    return
                }
            }

            const t = new Erc20Token(token)
            // Save token state to storage
            state.erc20TokensCustom.push(t)

            const w = rootState.activeWallet
            if (w) {
                t.updateBalance(w.ethAddress)
            }

            commit('saveCustomErc20Tokens')

            return t
        },

        async removeTokenList({ state, commit }, list: TokenList) {
            // Remove token list object
            for (let i = 0; i <= state.tokenLists.length; i++) {
                const l = state.tokenLists[i]

                if (l.url === list.url) {
                    state.tokenLists.splice(i, 1)
                    break
                }
            }

            // Remove custom Token list urls
            const index = state.tokenListsCustom.indexOf(list.url)
            state.tokenListsCustom.splice(index, 1)

            // Update local storage
            commit('saveCustomTokenLists')
        },

        async addTokenListUrl({ dispatch, state, commit }, data: AddTokenListInput) {
            // Make sure URL is not already added
            if (state.tokenListUrls.includes(data.url)) throw 'Already added.'
            if (state.tokenListsCustom.includes(data.url)) throw 'Already added.'

            const url = data.url
            const res = await axios.get(url)
            const tokenList: TokenList = res.data
            tokenList.url = url
            tokenList.readonly = data.readonly

            dispatch('addTokenList', tokenList)
        },

        async addTokenList({ state, dispatch, commit }, tokenList: TokenList) {
            const tokens: TokenListToken[] = tokenList.tokens
            state.tokenLists.push(tokenList)
            for (let i = 0; i < tokens.length; i++) {
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
            const listRaw = localStorage.getItem('token_lists')
            if (!listRaw) return
            const urls: string[] = JSON.parse(listRaw)

            urls.forEach((url) => {
                dispatch('addTokenListUrl', {
                    url: url,
                    readonly: false,
                })
            })
        },

        async initErc20List({ state, dispatch, commit }) {
            // Load default erc20 token contracts
            const erc20Tokens = await fetchTokenList()
            erc20Tokens.readonly = true
            erc20Tokens.url = 'Default'
            await dispatch('addTokenList', erc20Tokens)

            for (let i = 0; i < TOKEN_LISTS.length; i++) {
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
            const balanceDict: IWalletBalanceDict = state.balanceDict
            const nftDict: IWalletNftDict = getters.walletNftDict
            const nftMintDict: IWalletNftMintDict = getters.nftMintDict

            for (const id in balanceDict) {
                if (!state.assetsDict[id]) {
                    dispatch('addUnknownAsset', id)
                }
            }

            for (const nft_id in nftDict) {
                if (!state.nftFamsDict[nft_id]) {
                    dispatch('addUnknownNftFamily', nft_id)
                }
            }

            for (const familyId in nftMintDict) {
                if (!state.nftFamsDict[familyId]) {
                    dispatch('addUnknownNftFamily', familyId)
                }
            }
        },

        // Update the utxos for the current active wallet
        async updateUTXOs({ state, commit, dispatch, rootState }) {
            const wallet = rootState.activeWallet
            if (!wallet) {
                return false
            }

            await wallet.getUTXOs()
            dispatch('onUtxosUpdated')
            dispatch('updateERC20Balances')
            dispatch('ERC721/updateWalletBalance')
            commit('updateActiveAddress', null, { root: true })
        },

        // Only updates external utxos of the wallet
        async updateUTXOsExternal({ commit, dispatch, rootState }) {
            const wallet = rootState.activeWallet
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
            const wallet: WalletType | null = rootState.activeWallet
            if (!wallet) return
            // Old ledger wallets do not have an eth address
            if (!wallet.ethAddress) return

            const networkID = state.evmChainId
            const tokens: Erc20Token[] = getters.networkErc20Tokens
            tokens.forEach((token) => {
                if (token.data.chainId !== networkID) return
                token.updateBalance(wallet!.ethAddress)
            })
        },

        // What is the AVAX coin in the network
        async updateAvaAsset({ state, commit }) {
            const res = await avm.getAssetDescription('AVAX')
            const id = bintools.cb58Encode(res.assetID)
            state.AVA_ASSET_ID = id
            const asset = new AvaAsset(id, res.name, res.symbol, res.denomination)
            commit('addAsset', asset)
        },

        /**
         * Update the X-Chain asset dictionary, split balances into categories.
         * (locked, available, multisig)
         */
        updateBalanceDict({ state, rootState, getters }): IWalletBalanceDict {
            const utxoSet = getters.walletAvmUtxoSet
            if (utxoSet === null) return {}

            const dict: IWalletBalanceDict = {}

            const unixNox = UnixNow()
            const ZERO = new BN(0)

            const addrUtxos = utxoSet.getAllUTXOs()

            for (let n = 0; n < addrUtxos.length; n++) {
                const utxo = addrUtxos[n]

                // Process only SECP256K1 Transfer Output utxos, outputid === 07
                const outId = utxo.getOutput().getOutputID()

                if (outId !== 7) continue

                const utxoOut = utxo.getOutput() as AmountOutput

                const locktime = utxoOut.getLocktime()
                const threhsold = utxoOut.getThreshold()
                const amount = utxoOut.getAmount()
                const assetIdBuff = utxo.getAssetID()
                const assetId = bintools.cb58Encode(assetIdBuff)

                const owners = utxoOut.getAddresses()

                // Which category should the utxo fall under
                const isMultisig = threhsold > 1
                const isLocked = locktime.gt(unixNox)

                if (isMultisig) {
                    if (!dict[assetId]) {
                        dict[assetId] = {
                            locked: ZERO.clone(),
                            available: ZERO.clone(),
                            multisig: amount.clone(),
                        }
                    } else {
                        const amt = dict[assetId].multisig
                        dict[assetId].multisig = amt.add(amount)
                    }
                } else if (!isLocked) {
                    if (!dict[assetId]) {
                        dict[assetId] = {
                            locked: ZERO.clone(),
                            available: amount.clone(),
                            multisig: ZERO.clone(),
                        }
                    } else {
                        const amt = dict[assetId].available
                        dict[assetId].available = amt.add(amount)
                    }
                }
                // If locked
                else {
                    if (!dict[assetId]) {
                        dict[assetId] = {
                            locked: amount.clone(),
                            available: ZERO.clone(),
                            multisig: ZERO.clone(),
                        }
                    } else {
                        const amt = dict[assetId].locked
                        dict[assetId].locked = amt.add(amount)
                    }
                }
            }
            state.balanceDict = dict
            return dict
        },

        /**
         * Adds an unknown asset id to the assets dictionary
         */
        async addUnknownAsset({ state, commit }, assetId: string) {
            // get info about the asset
            const desc = await ava.XChain().getAssetDescription(assetId)
            const newAsset = new AvaAsset(assetId, desc.name, desc.symbol, desc.denomination)

            await commit('addAsset', newAsset)
            return desc
        },

        async addUnknownNftFamily({ state, commit }, assetId: string) {
            const desc = await ava.XChain().getAssetDescription(assetId)
            const newFam = new AvaNftFamily(assetId, desc.name, desc.symbol)

            await commit('addNftFamily', newFam)
            return desc
        },
    },
    getters: {
        networkErc20Tokens(state: AssetsState, getters, rootState: RootState): Erc20Token[] {
            const tokens = state.erc20Tokens.concat(state.erc20TokensCustom)
            const chainId = state.evmChainId

            const filt = tokens.filter((t) => {
                if (t.data.chainId !== chainId) return false
                return true
            })
            return filt
        },

        findErc20: (state) => (contractAddr: string) => {
            const tokens: Erc20Token[] = state.erc20Tokens.concat(state.erc20TokensCustom)
            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i]
                if (t.data.address === contractAddr) {
                    return t
                }
            }
            return null
        },

        // assset id -> utxos
        walletNftDict(state, getters, rootState) {
            const utxos = state.nftUTXOs
            const res: IWalletNftDict = {}

            for (let i = 0; i < utxos.length; i++) {
                const utxo = utxos[i]
                const assetIdBuff = utxo.getAssetID()
                // TODO: Encoding might be taking too much time
                const assetId = bintools.cb58Encode(assetIdBuff)

                if (res[assetId]) {
                    res[assetId].push(utxo)
                } else {
                    res[assetId] = [utxo]
                }
            }
            return res
        },

        walletAssetsDict(state, getters, rootState, rootGetters): IWalletAssetsDict {
            //@ts-ignore
            const balanceDict: IWalletBalanceDict = state.balanceDict
            // @ts-ignore
            const assetsDict: AssetsDict = state.assetsDict
            const res: IWalletAssetsDict = {}

            for (const assetId in assetsDict) {
                const balanceAmt = balanceDict[assetId]

                let asset: AvaAsset
                if (!balanceAmt) {
                    asset = assetsDict[assetId]
                    asset.resetBalance()
                } else {
                    asset = assetsDict[assetId]
                    asset.resetBalance()
                    asset.addBalance(balanceAmt.available)
                    asset.addBalanceLocked(balanceAmt.locked)
                    asset.addBalanceMultisig(balanceAmt.multisig)
                }

                // Add extras for AVAX token
                // @ts-ignore
                if (asset.id === state.AVA_ASSET_ID) {
                    asset.addExtra(getters.walletStakingBalance)
                    asset.addExtra(getters.walletPlatformBalance.available)
                    asset.addExtra(getters.walletPlatformBalance.locked)
                    asset.addExtra(getters.walletPlatformBalance.lockedStakeable)
                    asset.addExtra(getters.walletPlatformBalance.multisig)
                }

                res[assetId] = asset
            }
            return res
        },

        walletAssetsArray(state, getters): AvaAsset[] {
            const assetsDict: IWalletAssetsDict = getters.walletAssetsDict
            const res: AvaAsset[] = []

            for (const id in assetsDict) {
                const asset = assetsDict[id]
                res.push(asset)
            }
            return res
        },

        /**
         * Get the X-Chain (AVM) UTXO Set currently loaded in the wallet
         */
        walletAvmUtxoSet(state, getters, rootState): AVMUTXOSet | null {
            const wallet = rootState.activeWallet
            if (!wallet) return null
            return wallet.utxoset
        },

        nftFamilies(state): AvaNftFamily[] {
            return state.nftFams
        },

        walletStakingBalance(state, getters, rootState, rootGetters): BN {
            const wallet = rootState.activeWallet
            if (!wallet) return new BN(0)

            return wallet.stakeAmount
        },

        /**
         * Calculates balances (available, locked, lockedStakeable, multisig) from the active wallet's UTXO set.
         * @param state
         * @param getters
         * @param rootState
         */
        walletPlatformBalance(
            state,
            getters,
            rootState
        ): {
            available: BN
            locked: BN
            lockedStakeable: BN
            multisig: BN
        } {
            const wallet = rootState.activeWallet
            const balances = {
                available: new BN(0),
                locked: new BN(0),
                lockedStakeable: new BN(0),
                multisig: new BN(0),
            }

            if (!wallet || !state.AVA_ASSET_ID) return balances

            const utxoSet: PlatformUTXOSet = wallet.getPlatformUTXOSet()

            const now = UnixNow()

            const utxos = utxoSet.getAllUTXOs()
            // Only use AVAX UTXOs
            const avaxID = bintools.cb58Decode(state.AVA_ASSET_ID)
            const avaxUTXOs = utxos.filter((utxo) => utxo.getAssetID().equals(avaxID))

            for (let n = 0; n < avaxUTXOs.length; n++) {
                const utxo = avaxUTXOs[n]
                const utxoOut = utxo.getOutput()
                const outId = utxoOut.getOutputID()
                const threshold = utxoOut.getThreshold()

                // If its multisig utxo
                if (threshold > 1) {
                    balances.multisig.iadd((utxoOut as AmountOutput).getAmount())
                    continue
                }

                const isStakeableLock = outId === PlatformVMConstants.STAKEABLELOCKOUTID

                let locktime
                if (isStakeableLock) {
                    locktime = (utxoOut as StakeableLockOut).getStakeableLocktime()
                } else {
                    locktime = (utxoOut as AmountOutput).getLocktime()
                }

                // If normal unlocked utxo (includes stakeable lock that is in the past)
                if (locktime.lte(now)) {
                    balances.available.iadd((utxoOut as AmountOutput).getAmount())
                }
                // If locked utxo
                else if (!isStakeableLock) {
                    balances.locked.iadd((utxoOut as AmountOutput).getAmount())
                }
                // If stakeable lock utxo
                else if (isStakeableLock) {
                    balances.lockedStakeable.iadd((utxoOut as AmountOutput).getAmount())
                }
            }

            return balances
        },

        walletPlatformBalanceLocked(state, getters, rootState): BN {
            return getters.walletPlatformBalance.locked
        },

        walletPlatformBalanceLockedStakeable(state, getters, rootState): BN {
            return getters.walletPlatformBalance.lockedStakeable
        },

        nftMintDict(state): IWalletNftMintDict {
            const res: IWalletNftMintDict = {}
            const mintUTXOs = state.nftMintUTXOs

            for (let i = 0; i < mintUTXOs.length; i++) {
                const utxo: UTXO = mintUTXOs[i]
                const assetId = bintools.cb58Encode(utxo.getAssetID())

                const target = res[assetId]
                if (target) {
                    target.push(utxo)
                } else {
                    res[assetId] = [utxo]
                }
            }

            // sort by groupID
            for (const id in res) {
                res[id].sort((a, b) => {
                    const idA = (a.getOutput() as NFTMintOutput).getGroupID()
                    const idB = (b.getOutput() as NFTMintOutput).getGroupID()

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
            const walletBalanceDict = getters.walletAssetsDict
            const AVA_ASSET_ID = state.AVA_ASSET_ID
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
