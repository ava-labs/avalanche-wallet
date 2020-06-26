import {Module, Store} from "vuex";
import {
    AddressUtxoDict,
    AssetAPI,
    AssetDescription,
    AssetsDict,
    AssetsState,
    IBalanceDict
} from "@/store/modules/assets/types";
import {RootState} from "@/store/types";
import {ava, avm, bintools} from "@/AVA";
import {AmountOutput, UTXOSet} from "avalanche";
import Vue from "vue";
import AvaAsset from "@/js/AvaAsset";
import {explorer_api} from "@/explorer_api";
import AvaHdWallet from "@/js/AvaHdWallet";

const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    state: {
        AVA_ASSET_ID: null,
        isUpdateBalance: false,
        utxo_set: null,
        utxos: [],
        descriptions: {},
        assets: [],
        assetsDict: {}, // holds meta data of assets
        balanceDict: {}, // holds how much the user holds of a asset
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
            state.utxo_set = null;
            state.utxos = [];
            state.descriptions = {};
        },


        // syncAssets({state, rootState}){
        //     let assetsDict = state.assetsDict;
        //     let wallet = rootState.activeWallet;
        //
        //     let assetIds = wallet.utxoset.getAssetIDs();
        //         assetIds =
        // },

        // Gets UTXOs from the active HD wallet
        // async syncAssets(){
        //
        // }
        //

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
                commit('setIsUpdateBalance', false);
            }catch(e){
                commit('setIsUpdateBalance', false);
                return false;
            }


            //
        //     // let set = await rootState.activeWallet.getUTXOs();
        //
        //     rootState.activeWallet.getUTXOs().then(set => {
        //         let utxos = set.getAllUTXOs();
        //         commit('setIsUpdateBalance', false);
        //
        //         let assetIds = set.getAssetIDs();
        //         console.log(assetIds);
        //         console.log("UTXOS");
        //
        //         state.utxo_set = set;
        //         state.utxos = utxos;
        //         commit('updateActiveAddress', null, {root: true});
        //         // dispatch('updateBalances');
        //     })
        },

        // async readWalletBalance({state,rootState,dispatch}){
        //     await dispatch('clearBalances');
        //
        //     if(!rootState.activeWallet) return;
        //     if(!rootState.activeWallet.utxoset) return;
        // },

        // Scan the UTXOs, create a assetId -> balance dict and update assetsDict
        // async readWalletBalance({state, getters, dispatch, rootState}){
        //     await dispatch('clearBalances');
        //
        //     if(!rootState.activeWallet) return;
        //     if(!rootState.activeWallet.utxoset) return;
        //
        //     let utxos = await rootState.activeWallet.utxoset.getAllUTXOs();
        //     let dict:IBalanceDict = {};
        //     for(var i=0;i<utxos.length;i++){
        //         let utxo = utxos[i];
        //         let assetId:string = bintools.avaSerialize(utxo.getAssetID());
        //         // let amount = utxo.getAmount();
        //         let amountOut = utxo.getOutput() as AmountOutput;
        //         let amount = amountOut.getAmount();
        //         let assetsDict = state.assetsDict;
        //
        //         if(!assetsDict[assetId]){
        //             dispatch('addUnknownAsset', assetId);
        //         }
        //
        //         if(dict[assetId]){
        //             dict[assetId].add(amount)
        //         }else{
        //             dict[assetId] = amount;
        //         }
        //     }
        //     state.balanceDict = dict;
        // },



        // Sets every balance to 0
        async clearBalances({state}){
            state.assets.forEach(asset => {
                asset.resetBalance();
            });
            return;
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
            console.log(`Adding unknown asset ${assetId}..`);
            let desc = await ava.AVM().getAssetDescription(assetId);
            let newAsset = new AvaAsset(assetId, desc.name, desc.symbol, desc.denomination);

            await commit('addAsset', newAsset);
            return desc;
        },

        // Gets meta data for all the assets in the wallet
        // updateAssetsData({state, getters}){
        //     let assetIds = getters.assetIds;
        //
        //     for(var i=0; i<assetIds.length; i++) {
        //         let id_buf = assetIds[i];
        //         let id = bintools.avaSerialize(id_buf);
        //
        //         // See if description already exists
        //         if(state.descriptions[id]){
        //             console.log("Description Exists");
        //         }
        //         // Fetch Description
        //         else{
        //             avm.getAssetDescription(id_buf).then((res:AssetDescription) => {
        //                 let name = res.name.trim();
        //                 let symbol = res.symbol.trim();
        //                 let denomination = res.denomination;
        //
        //                 Vue.set(state.descriptions, id, {
        //                     name: name,
        //                     symbol: symbol,
        //                     denomination: denomination
        //                 });
        //             }).catch(err => {
        //                 console.log(err);
        //             });
        //         }
        //     }
        // },

        getAllUTXOsForAsset(store, assetId:string){
            let set = new UTXOSet();
            let utxos = store.state.utxos;
            for(var i in utxos){
                let utxo = utxos[i];
                let aId = bintools.avaSerialize(utxo.getAssetID());
                if(aId===assetId){
                    set.add(utxo);
                }
            }
            return set;
        }
    },
    getters: {
        AssetAVA(state,getters, rootState, rootGetters): AvaAsset|null{
            let walletBalanceDict = rootGetters.walletBalanceDict;
            let AVA_ASSET_ID = state.AVA_ASSET_ID;
            if(AVA_ASSET_ID){
                if(walletBalanceDict[AVA_ASSET_ID]){
                    return walletBalanceDict[AVA_ASSET_ID];
                }
            }
            return null;
        },
        assetIds(state){
            let utxo_set = state.utxo_set;
            if(!utxo_set) return [];
            return utxo_set.getAssetIDs();
        },

        addressUTXOs(state):AddressUtxoDict{
            if (!state.utxo_set) return {};

            let res:AddressUtxoDict = {};
            let utxos = state.utxos;


            for(var i=0; i < utxos.length; i++) {
                let utxo = utxos[i];
                let utxoOut = utxo.getOutput() as AmountOutput;

                let addrs = utxoOut.getAddresses();

                let amount = utxoOut.getAmount();
                let assetIdBuff = utxo.getAssetID();
                let assetId = bintools.avaSerialize(assetIdBuff);

                for(var  n=0 ;n<addrs.length; n++){
                    let addr = addrs[n];
                    let addrString = bintools.avaSerialize(addr);
                    // console.log(addrString)

                    if(!res[addrString]){
                        res[addrString] = [utxo]
                    }else{
                        res[addrString].push(utxo)
                    }
                }
            }

            return res;
        },

        //  Assets in array form and ordered alphabetically
        assetsArray(state, getters):AvaAsset[]{
            let dict = getters.assetsDict;

            let res:AvaAsset[] = [];
            for(var i in dict){
                let asset = dict[i];
                res.push(asset);
            }

            res.sort(function(a,b){
                let symbolA = a.symbol.toUpperCase();
                let symbolB = b.symbol.toUpperCase();

                if (symbolA < symbolB) {
                    return -1;
                }
                if (symbolA > symbolB) {
                    return 1;
                }

                return 0;
            });

            return res;
        }
    }

};

export default assets_module;
