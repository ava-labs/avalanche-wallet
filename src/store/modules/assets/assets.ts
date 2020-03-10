import {Module, Store} from "vuex";
import {AddressUtxoDict, AssetDescription, AssetsDict, AssetsState} from "@/store/modules/assets/types";
import {RootState} from "@/store/types";
import {avm, bintools} from "@/AVA";
import {UTXOSet} from "slopes";
import Vue from "vue";
import AvaAsset from "@/js/AvaAsset";



let AVA_ASSET_ID:string;


avm.getAssetDescription('AVA').then(res => {
    AVA_ASSET_ID = bintools.avaSerialize(res.assetID);
});



const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    state: {
        isUpdateBalance: false,
        utxo_set: null,
        utxos: [],
        descriptions: {}
    },
    mutations: {

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
        updateUTXOs({state, commit, dispatch, rootState}){
            console.log("UPDATE UTXOS ASSET mod");
            state.isUpdateBalance = true;
            avm.getUTXOs(rootState.addresses).then((res: UTXOSet) =>{
                console.log("GOT SET");
                let utxos = res.getAllUTXOs();

                state.isUpdateBalance = false;
                state.utxo_set = res;
                state.utxos = utxos;

                dispatch('updateAssetsData');
            }).catch(err => {
                console.log(err);
                state.isUpdateBalance = false;
            });
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
                if(getters.assetsDict[AVA_ASSET_ID]){
                    return getters.assetsDict[AVA_ASSET_ID];
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
        assetsDict(state):AssetsDict{
            let res:AssetsDict = {};

            let utxos = state.utxos;
            for(let utxoId in utxos) {
                let utxo = utxos[utxoId];

                let asset_id_buffer = utxo.getAssetID();
                let asset_id = bintools.avaSerialize(asset_id_buffer);

                let asset_amount_bn = utxo.getAmount();
                // let asset_amount = asset_amount_bn.toNumber();

                let asset_desc = state.descriptions[asset_id];

                // The asset must have a description to add to the results
                if(asset_desc){
                    // If asset exists add to total balance
                    if(res[asset_id]){
                        let asset = res[asset_id];
                            asset.addBalance(asset_amount_bn);
                    }else{
                        let newAsset = new AvaAsset(asset_id, asset_desc.name, asset_desc.symbol, asset_desc.denomination);
                            newAsset.addBalance(asset_amount_bn);
                        res[asset_id] = newAsset
                    }
                }

            }
            return res;
        },

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