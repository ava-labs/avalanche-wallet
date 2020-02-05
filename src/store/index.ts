import Vue from 'vue'
import Vuex from 'vuex'

import Auth from './modules/auth/auth';
import {SecpUTXO, UTXOSet} from "slopes";
import {AssetNamesDict, AssetType, BalanceDict, RootState, IssueTxInput} from "@/store/types";
Vue.use(Vuex);

import router from "@/router";

// import BN from 'bn.js';
const BN = require('bn.js');

import {avm, bintools, getAllUTXOsForAsset, keyChain} from "@/AVA";
import * as slopes from "slopes";


const asset_names:AssetNamesDict = {

};

export default new Vuex.Store({
    modules:{
        Auth
    },
    state: {
        isUpdateBalance: false,
        utxo_set: null,
        utxos: {},
        isAuth: false,
        privateKey: '',
        // publicKey: '',
        address: '',
        modals: {},
        assets: [
        ],
        tx_history: [
        ]
    },
    getters: {
        isAuthenticated(state: RootState){
            if(state.privateKey != '') return true;
            else return false;
        },
        wallet_value_usd(state: RootState){
            let res = 0;
            res = state.assets.reduce((total: number, asset: AssetType) => {
                return total + (asset.balance*asset.usd_price)
            }, 0);

            return res;
        },
        wallet_value_btc(state: RootState){
            let res = 0;
            res = state.assets.reduce((total: number, asset: AssetType) => {
                return total + (asset.balance*asset.btc_price)
            }, 0);
            return res;
        },
        wallet_value_ava(state: RootState){
            let res = 0;
            res = state.assets.reduce((total: number, asset: AssetType) => {
                return total + (asset.balance*asset.ava_price)
            }, 0);
            return res;
        },
        balanceArray(state, getters){
            let balances = getters.balance;
            let res = [];
            for(var i in balances){
                let asset = balances[i];
                res.push(asset);
            }
            return res;
        },
        balance(state: RootState){
            let utxos = state.utxos;
            let res:BalanceDict = {};
            // console.log(utxos);
            for(var id in utxos){
                let utxo = utxos[id];

                // console.log(utxo);

                let asset_id_buffer = utxo.getAssetID();
                let asset_id = bintools.avaSerialize(asset_id_buffer);

                let asset_amount_bn = utxo.getAmount();
                let asset_amount = asset_amount_bn.toNumber();

                // console.log(asset_id,asset_amount);
                if(res[asset_id]){
                    res[asset_id].balance += asset_amount;
                }else{
                    let coin_data = asset_names[asset_id] || {
                        name: asset_id,
                        symbol: asset_id.substr(0,3)
                    };


                    let assetObj = {
                        id: asset_id,
                        name: '',
                        symbol: '',
                        balance: asset_amount,
                        usd_price: 0.008,
                        btc_price: 0.0004311,
                        ava_price: 1,
                    };
                    assetObj.name = coin_data.name;
                    assetObj.symbol = coin_data.symbol.toUpperCase();

                    res[asset_id] = assetObj;
                }
            }

            return res;
        }
    },
    mutations: {
        setAuth(state,val){
            state.isAuth = val;
        },
        setAddress(state, val){
            state.address = val;
        },
        setPrivateKey(state,val){
            state.privateKey = val;
        },
        setUTXOs(state, val){
            state.utxos = val;
        },
        setUTXOSet(state,val){
            state.utxo_set = val;
        }
    },
    actions: {
        // Used in home page to access a user's wallet
        accessWallet(store, pk: string){
            // console.log(pk);
            let privateKeyBuf = bintools.avaDeserialize(pk);
            let address = keyChain.importKey(privateKeyBuf);

            // console.log("YO");

            store.commit('setPrivateKey', pk);
            store.commit('setAddress', address);
            store.commit('setAuth', true);
            store.dispatch('onAccess');

            router.push('/wallet/ava');
        },

        onAccess(store){
            // console.log("onAccess");
            // console.log(store.state.privateKey);
            store.dispatch('updateUTXOs')
        },


        updateAssetsData(store){
            if(!store.state.utxo_set) return;
            let assets = store.state.utxo_set.getAssetIDs();

            for(var i=0; i<assets.length; i++){
                let asset_buf = assets[i];
                let asset_id = bintools.avaSerialize(asset_buf);


                avm.getAssetDescription(asset_buf).then(res => {
                    asset_names[asset_id] = {
                        name: res.name.trim(),
                        symbol: res.symbol.trim()
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        },


        updateUTXOs(store){
            console.log(store.state.address);
            // let addresses = avm.keyChain().getAddresses();
            // console.log(addresses,store.state.address)
            store.state.isUpdateBalance = true;
            avm.getUTXOs([store.state.address]).then((res: UTXOSet) =>{
                store.state.isUpdateBalance = false;

                store.commit('setUTXOSet', res);

                let utxos = res.getAllUTXOs();
                store.commit('setUTXOs', utxos);

                store.dispatch('updateAssetsData');
            }).catch(err => {
                console.log(err);
                store.state.isUpdateBalance = false;
            });
        },

        openModal(store, id: string){
            let modal = store.state.modals[id];
            if(modal){
                modal.open();
            }
        },

        async issueTx(store, data:IssueTxInput){


            let myAddresses = [store.state.address];
            let toAddresses = [data.toAddress];

            let assetId = data.assetId;
            // let utxos = await avm.getUTXOs(myAddresses);
            let utxos = getAllUTXOsForAsset(assetId);
            let sendAmount = new BN(data.amount);

            // console.log("issue tx");
            // console.log( sendAmount.toNumber(), assetId, utxos );
            // console.log(utxos);

            let unsigned_tx = avm.makeUnsignedTx(utxos, sendAmount, toAddresses, myAddresses, myAddresses, data.assetId);
            let signed_tx = avm.signTx(unsigned_tx);

            // console.log(signed_tx);
            // console.log(signed_tx.toBuffer().toString('hex'));


            let txid = await avm.issueTx(signed_tx);
            return txid;
        },

        async issueBatchTx(store, data){
            // console.log("SENDING BATCH TX");
            // console.log(data);

            let orders = data.orders;
            for(var i=0; i<orders.length; i++){
                let order = orders[i];

                // console.log(order.asset.id, order.amount,data.toAddress);
                // If no amount to send, skip it
                if(!order.amount) continue;

                await store.dispatch('issueTx', {
                    assetId: order.asset.id,
                    amount: order.amount,
                    toAddress: data.toAddress
                }).catch(err => {
                    alert(err);
                    return 'error';
                });
            }

            setTimeout(() => {
                store.dispatch('updateUTXOs');
            }, 5000);

            return 'success';
        },

        // async createAsset(store, amt: number){
        //     let amount = new BN(amt);
        //
        //     let addr1 = store.state.address;
        //
        //     let output = new slopes.OutCreateAsset(amount, [addr1]);
        //     let unsigned = new slopes.TxUnsigned([], [output]);
        //     let signed = keyChain.signTx(unsigned);
        //
        //     let txid = await avm.issueTx(signed); //returns an AVA serialized string for the TxID
        //
        //     setTimeout(async () => {
        //         let status = await avm.getTxStatus(txid);
        //         console.log(status);
        //     })
        // }
    },
})
