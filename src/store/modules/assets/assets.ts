import {Module} from "vuex";
import {
    AssetAPI,
    AssetsState,
} from "@/store/modules/assets/types";
import {IWalletBalanceDict, RootState} from "@/store/types";
import {ava, avm, bintools} from "@/AVA";
import Vue from "vue";
import AvaAsset from "@/js/AvaAsset";
import {explorer_api} from "@/explorer_api";

const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    state: {
        AVA_ASSET_ID: null,
        isUpdateBalance: false,
        assets: [],
        assetsDict: {}, // holds meta data of assets
    },
    mutations: {
        addAsset(state, asset:AvaAsset){
            if(state.assetsDict[asset.id]){
                console.info(`Failed to add asset. Asset already exists. (${asset.id})`);
                return;
            }
            state.assets.push(asset);
            Vue.set(state.assetsDict,asset.id,asset);
        },
        removeAllAssets(state){
            state.assets = [];
            state.assetsDict = {};
        },
        setIsUpdateBalance(state, val){
            state.isUpdateBalance = val;
        }
    },
    actions: {
        // Called on a logout event
        onlogout({state}){
            state.isUpdateBalance = false;
        },

        // Gets the balances of the active wallet and gets descriptions for unknown asset ids
        addUnknownAssets({state, getters, rootGetters, dispatch}){
            let balanceDict:IWalletBalanceDict = rootGetters.walletBalanceDict

            for(var id in balanceDict){
                if(!state.assetsDict[id]){
                    dispatch('addUnknownAsset', id);
                }
            }
        },

        async updateUTXOs({state, commit, dispatch, rootState}) {
            let wallet = rootState.activeWallet;
            if(!wallet){
                return false;
            }
            commit('setIsUpdateBalance', true);

            try{
                await wallet.getUTXOs();
                commit('updateActiveAddress', null, {root: true});
                dispatch('History/updateTransactionHistory', null, {root: true});
                dispatch('addUnknownAssets');
                commit('setIsUpdateBalance', false);
            }catch(e){
                commit('setIsUpdateBalance', false);
                return false;
            }
        },

        // What is the AVA coin in the network
        async updateAvaAsset({state, commit}){
            let res = await avm.getAssetDescription('AVA');
            let id = bintools.avaSerialize(res.assetID);
            state.AVA_ASSET_ID = id;
            let asset = new AvaAsset(id, res.name, res.symbol, res.denomination);
            commit('addAsset', asset);
        },

        // fetch every asset from the explorer, if explorer exists
        // We can use it later
        updateAssets({state, rootState, commit}){
            //@ts-ignore
            let explorerApi = rootState.Network.selectedNetwork.explorerUrl;
            if(explorerApi){
                explorer_api.get('/x/assets').then(res => {
                    let assets:AssetAPI[] = res.data.assets;
                    assets.forEach(asset => {
                        let newAsset = new AvaAsset(asset.id, asset.name, asset.symbol, asset.denomination);
                        commit('addAsset', newAsset)
                    });
                });
            }
        },

        // Adds an unknown asset id to the assets dictionary
        async addUnknownAsset({state, commit}, assetId:string){
            // get info about the asset
            let desc = await ava.AVM().getAssetDescription(assetId);
            let newAsset = new AvaAsset(assetId, desc.name, desc.symbol, desc.denomination);

            await commit('addAsset', newAsset);
            return desc;
        },
    },
    getters: {
        AssetAVA(state,getters, rootState, rootGetters): AvaAsset|null{
            let walletBalanceDict = rootGetters.walletAssetsDict;
            let AVA_ASSET_ID = state.AVA_ASSET_ID;
            if(AVA_ASSET_ID){
                if(walletBalanceDict[AVA_ASSET_ID]){
                    return walletBalanceDict[AVA_ASSET_ID];
                }
            }
            return null;
        },
    }

};

export default assets_module;
