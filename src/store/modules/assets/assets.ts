import { Module } from 'vuex'
import { AssetAPI, AssetsDict, AssetsState } from '@/store/modules/assets/types'
import {
    IWalletAssetsDict,
    IWalletBalanceDict,
    IWalletNftDict,
    IWalletNftMintDict,
    RootState,
    WalletType,
} from '@/store/types'
import { ava, avm, bintools } from '@/AVA'
import Vue from 'vue'
import AvaAsset from '@/js/AvaAsset'

import { AvaNftFamily } from '@/js/AvaNftFamily'
import {
    AmountOutput,
    UTXOSet as AVMUTXOSet,
    UTXO as AVMUTXO,
    UTXO,
    NFTMintOutput,
} from 'avalanche/dist/apis/avm'
import { UnixNow } from 'avalanche/dist/utils'
import BN from 'bn.js'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm/utxos'
import { StakeableLockOut } from 'avalanche/dist/apis/platformvm'

const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
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
        // setIsUpdateBalance(state, val) {
        //     state.isUpdateBalance = val
        // },
    },
    actions: {
        // Called on a logout event
        onlogout({ state, commit }) {
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

            state.nftUTXOs = nftUtxos
            state.nftMintUTXOs = nftMintUtxos
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
            commit('updateActiveAddress', null, { root: true })
        },

        // What is the AVA coin in the network
        async updateAvaAsset({ state, commit }) {
            let res = await avm.getAssetDescription('AVAX')
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

        // fetch every asset from the explorer, if explorer exists
        // We can use it later
        // updateAssets({state, rootState, commit}){
        //     //@ts-ignore
        //     let explorerApi = rootState.Network.selectedNetwork.explorerUrl;
        //     if(explorerApi){
        //         explorer_api.get('/x/assets').then(res => {
        //             let assets:AssetAPI[] = res.data.assets;
        //             assets.forEach(asset => {
        //                 let newAsset = new AvaAsset(asset.id, asset.name, asset.symbol, asset.denomination);
        //                 commit('addAsset', newAsset)
        //             });
        //         });
        //     }
        // },

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
        // avmAvaxUtxos(state, getters, rootState): AVMUTXO[] {
        //     let wallet = rootState.activeWallet
        //     // let avaxAsset: AvaAsset|null = getters.AssetAVA
        //
        //     if (!wallet) return []
        //     // if (avaxAsset === null) return []
        //
        //     let utxoSet: AVMUTXOSet | null = getters.walletAvmUtxoSet
        //     if (!utxoSet) return []
        //
        //     let avaxID = state.AVA_ASSET_ID
        //
        //     let utxos = utxoSet.getAllUTXOs()
        //
        //     let avaxUtxos = utxos.filter((utxo) => {
        //         let outId = utxo.getOutput().getOutputID()
        //         if (outId !== 7) return false
        //
        //         let utxoOut = utxo.getOutput() as AmountOutput
        //         let locktime = utxoOut.getLocktime()
        //         let assetIdBuff = utxo.getAssetID()
        //         let assetId = bintools.cb58Encode(assetIdBuff)
        //
        //         if (assetId !== avaxID) {
        //             return false
        //         }
        //         return true
        //     })
        //     return avaxUtxos
        // },
        //
        // avmAvaxBalanceUnlocked(state, getters, rootState): BN {
        //     let wallet = rootState.activeWallet
        //     if (!wallet) return new BN(0)
        //
        //     // let utxoSet: AVMUTXOSet|null = getters.walletAvmUtxoSet
        //     // if(!utxoSet) return new BN(0)
        //
        //     // let utxos = utxoSet.getAllUTXOs()
        //     let avaxUtxos = getters.avmAvaxUtxos
        //     console.log(avaxUtxos)
        //
        //     let now = UnixNow()
        //
        //     let tot = new BN(0)
        //     for (var i = 0; i < avaxUtxos.length; i++) {
        //         let utxo = avaxUtxos[i]
        //         // let outId = utxo.getOutput().getOutputID()
        //         //
        //         // Process only SECP256K1 Transfer Output utxos, outputid === 07
        //         // if (outId !== 7) continue
        //         let utxoOut = utxo.getOutput() as AmountOutput
        //         let locktime = utxoOut.getLocktime()
        //         let amount = utxoOut.getAmount()
        //         let assetIdBuff = utxo.getAssetID()
        //         let assetId = bintools.cb58Encode(assetIdBuff)
        //
        //         if (locktime.lt(now)) {
        //             tot = tot.add(amount)
        //         }
        //     }
        //     return tot
        // },

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

                // Add extras for AVAX token
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

            // The only type of asset is AVAX on the P chain
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

            // The only type of asset is AVAX on the P chain
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

            // The only type of asset is AVAX on the P chain
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
