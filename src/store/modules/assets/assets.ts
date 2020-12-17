import { Module } from 'vuex'
import { AssetsState } from '@/store/modules/assets/types'
import { IWalletBalanceDict, IWalletNftDict, IWalletNftMintDict, RootState } from '@/store/types'
import { ava, avm, bintools } from '@/AVA'
import Vue from 'vue'
import AvaAsset from '@/js/AvaAsset'

import { AvaNftFamily } from '@/js/AvaNftFamily'
import { ITransactionData } from '../history/types'

const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    state: {
        AVA_ASSET_ID: null,
        isUpdateBalance: false,
        assets: [],
        assetsDict: {}, // holds meta data of assets
        nftFams: [],
        nftFamsDict: {},
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
            state.AVA_ASSET_ID = null
        },
        setIsUpdateBalance(state, val) {
            state.isUpdateBalance = val
        },
    },
    actions: {
        // Called on a logout event
        onlogout({ state, commit }) {
            state.isUpdateBalance = false
            commit('removeAllAssets')
        },

        // Gets the balances of the active wallet and gets descriptions for unknown asset ids
        addUnknownAssets({ state, getters, rootGetters, rootState, dispatch }) {
            let balanceDict: IWalletBalanceDict = rootGetters.walletBalanceDict
            let nftDict: IWalletNftDict = rootGetters.walletNftDict
            let nftMintDict: IWalletNftMintDict = rootGetters.walletNftMintDict

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
            commit('setIsUpdateBalance', true)

            try {
                await wallet.getUTXOs()
                commit('updateActiveAddress', null, { root: true })
                dispatch('History/updateTransactionHistory', null, {
                    root: true,
                })
                dispatch('addUnknownAssets')
                commit('setIsUpdateBalance', false)
            } catch (e) {
                commit('setIsUpdateBalance', false)
                return false
            }
        },

        // What is the AVA coin in the network
        async updateAvaAsset({ state, commit }) {
            let res = await avm.getAssetDescription('AVAX')
            let id = bintools.cb58Encode(res.assetID)
            state.AVA_ASSET_ID = id
            let asset = new AvaAsset(id, res.name, res.symbol, res.denomination)
            commit('addAsset', asset)
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

        updateNftsFromHistory({ state, dispatch }, transactions: ITransactionData[]) {
            let newFams: string[] = []

            for (var txN in transactions) {
                let tx = transactions[txN]
                if (tx.type === 'operation') {
                    let ins = tx.inputs
                    let outs = tx.outputs

                    ins.forEach((val) => {
                        const familyId = val.output.assetID
                        if (val.output.payload) {
                            if (!newFams.includes(familyId)) {
                                newFams.push(familyId)
                            }
                        }
                    })

                    outs.forEach((val) => {
                        const familyId = val.assetID
                        if (val.payload) {
                            if (!newFams.includes(familyId)) {
                                newFams.push(familyId)
                            }
                        }
                    })
                }
            }

            newFams.forEach((val) => {
                dispatch('addUnknownNftFamily', val)
            })
        },
    },
    getters: {
        nftFamilies(state): AvaNftFamily[] {
            return state.nftFams
        },
        AssetAVA(state, getters, rootState, rootGetters): AvaAsset | null {
            let walletBalanceDict = rootGetters.walletAssetsDict
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
