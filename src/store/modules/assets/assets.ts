import {Module, Store} from "vuex";
import {AddressUtxoDict, AssetAPI, AssetDescription, AssetsDict, AssetsState} from "@/store/modules/assets/types";
import {RootState} from "@/store/types";
import {ava, avm, bintools} from "@/AVA";
import {UTXOSet} from "slopes";
import Vue from "vue";
import AvaAsset from "@/js/AvaAsset";
import {explorer_api} from "@/explorer_api";


let AVA_ASSET_ID:string;






const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    state: {
        isUpdateBalance: false,
        utxo_set: null,
        utxos: [],
        descriptions: {},
        assets: [],
        assetsDict: {},
    },
    mutations: {
        addAsset(state, asset:AvaAsset){
            if(state.assetsDict[asset.id]){
                console.info(`Failed to add asset. Asset already exists. (${asset.id})`);
                return;
            }
            state.assets.push(asset);
            Vue.set(state.assetsDict,asset.id,asset);
            // state.assetsDict[asset.id] = asset;
            // console.log(`ADDED ${asset.id}`);
        },
        removeAllAssets(state){
            state.assets = [];
            state.assetsDict = {};
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

        // Fetches UTXOs of the addresses registered to the wallet
        async updateUTXOs({state, commit, dispatch, rootState}) {
            state.isUpdateBalance = true;
            let res: UTXOSet = await ava.AVM().getUTXOs(rootState.addresses);
            let utxos = res.getAllUTXOs();
            state.isUpdateBalance = false;
            state.utxo_set = res;
            state.utxos = utxos;

            await dispatch('updateBalances');
        },

        // Looks at utxo's and updates balances for each asset
        async updateBalances({state, getters, dispatch, rootState}){
            await dispatch('clearBalances');


            let utxos = state.utxos;

            for(var i=0;i<utxos.length;i++){
                let utxo = utxos[i];
                let assetId:string = bintools.avaSerialize(utxo.getAssetID());
                let amount = utxo.getAmount();
                let dict = state.assetsDict;

                // Because we populate the assets dictionary from the explorer api, we cannot query any other network including localhost
                // and this causes the assetId to not exist
                if(dict[assetId]){
                    dict[assetId].addBalance(amount);
                }else{
                    // Add Unknown Asset
                    await dispatch('addUnknownAsset', assetId);
                    dict[assetId].addBalance(amount);
                }
            }
        },

        async addUnknownAsset({state, commit}, assetId:string){
            // get info about the asset
            let desc = await ava.AVM().getAssetDescription(assetId);
            let newAsset = new AvaAsset(assetId, desc.name, desc.symbol, desc.denomination);

            await commit('addAsset', newAsset);
            return desc;
        },

        // Sets every balance to 0
        async clearBalances({state}){
            state.assets.forEach(asset => {
                asset.resetBalance();
            });
            return;
        },

        // What is the AVA coin in the network
        async updateAvaAsset(){
            avm.getAssetDescription('AVA').then(res => {
                AVA_ASSET_ID = bintools.avaSerialize(res.assetID);
            });
        },
        // fetch every asset from the explorer, if explorer exists
        updateAssets({state, rootState, commit}){
            // console.log(rootState);
            commit('removeAllAssets');

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

        // Gets meta data for all the assets in the wallet
        updateAssetsData({state, getters}){
            let assetIds = getters.assetIds;

            for(var i=0; i<assetIds.length; i++) {
                let id_buf = assetIds[i];
                let id = bintools.avaSerialize(id_buf);

                // See if description already exists
                if(state.descriptions[id]){
                    console.log("Description Exists");
                }
                // Fetch Description
                else{
                    avm.getAssetDescription(id_buf).then((res:AssetDescription) => {
                        let name = res.name.trim();
                        let symbol = res.symbol.trim();
                        let denomination = res.denomination;

                        Vue.set(state.descriptions, id, {
                            name: name,
                            symbol: symbol,
                            denomination: denomination
                        });

                        // console.log(state)
                    }).catch(err => {
                        console.log(err);
                    });
                }
            }
        },

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
        AssetAVA(state,getters){
            if(AVA_ASSET_ID){
                if(state.assetsDict[AVA_ASSET_ID]){
                    return state.assetsDict[AVA_ASSET_ID];
                }
            }
            return null;
        },
        assetIds(state){
            let utxo_set = state.utxo_set;
            if(!utxo_set) return [];
            return utxo_set.getAssetIDs();
        },

        // Combine all UTXOs from all addresses to have an overall asset list
        // assetsDict(state):AssetsDict{
        //     let res:AssetsDict = {};
        //
        //     state.assets.forEach(asset => {
        //        res[asset.id] = asset;
        //     });
        //
        //     // let utxos = state.utxos;
        //     // for(let utxoId in utxos) {
        //     //     let utxo = utxos[utxoId];
        //     //
        //     //     let asset_id_buffer = utxo.getAssetID();
        //     //     let asset_id = bintools.avaSerialize(asset_id_buffer);
        //     //
        //     //     let asset_amount_bn = utxo.getAmount();
        //     //     // let asset_amount = asset_amount_bn.toNumber();
        //     //
        //     //     let asset_desc = state.descriptions[asset_id];
        //     //
        //     //     // The asset must have a description to add to the results
        //     //     if(asset_desc){
        //     //         // If asset exists add to total balance
        //     //         if(res[asset_id]){
        //     //             let asset = res[asset_id];
        //     //                 asset.addBalance(asset_amount_bn);
        //     //         }else{
        //     //             let newAsset = new AvaAsset(asset_id, asset_desc.name, asset_desc.symbol, asset_desc.denomination);
        //     //                 newAsset.addBalance(asset_amount_bn);
        //     //             res[asset_id] = newAsset
        //     //         }
        //     //     }
        //     //
        //     // }
        //     return res;
        // },

        addressUTXOs(state):AddressUtxoDict{
            if (!state.utxo_set) return {};

            let res:AddressUtxoDict = {};
            let utxos = state.utxos;


            for(var i=0; i < utxos.length; i++) {
                let utxo = utxos[i];
                let addrs = utxo.getAddresses();
                let amount = utxo.getAmount();
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
