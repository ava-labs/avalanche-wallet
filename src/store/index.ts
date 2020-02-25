import Vue from 'vue'
import Vuex from 'vuex'

import Auth from './modules/auth/auth';
import Notifications from './modules/notifications/notifications';
import Big from 'big.js';
import {SecpUTXO, UTXOSet, AVMKeyPair} from "slopes";
import {
    AssetType,
    BalanceDict,
    RootState,
    IssueTxInput,
    KeyFile,
    KeyFileKey,
    AssetMeta, IssueBatchTxInput, AddressUTXOs
} from "@/store/types";
Vue.use(Vuex);

import router from "@/router";

// import BN from 'bn.js';
const BN = require('bn.js');

import AvaAsset from '@/js/AvaAsset.ts';

import {avm, bintools, cryptoHelpers, getAllUTXOsForAsset, keyChain} from "@/AVA";
import * as slopes from "slopes";



const AVA_ASSET_ID = process.env.VUE_APP_AVA_ASSET_ID;
console.log(AVA_ASSET_ID);
// const asset_names:AssetNamesDict = {
//
// };

export default new Vuex.Store({
    modules:{
        Auth,
        Notifications
    },
    state: {
        asset_meta: {},
        isUpdateBalance: false,
        utxo_set: null,
        utxos: [],
        isAuth: false,
        privateKey: '',
        addresses: [],
        selectedAddress: '',
        modals: {},
        assets: [
        ],
        tx_history: [
        ]
    },
    getters: {
        AVABalance(state, getters){
            if(AVA_ASSET_ID){
                if(getters.balance[AVA_ASSET_ID]){
                    return getters.balance[AVA_ASSET_ID].balance;
                }
            }
            return 0;
        },
        isAuthenticated(state: RootState){
            if(state.privateKey != '') return true;
            else return false;
        },

        // returns a dictionary of balances by key
        addressUTXOs(state: RootState, getters):AddressUTXOs{
            if(!state.utxo_set) return {};

            let res:AddressUTXOs = {};
            let addresses = state.utxo_set.getAddresses();
            let utxos = state.utxos;

            // console.log(state.utxos);
            for(var i=0; i < utxos.length; i++){
                // console.log();
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
                // console.log(addrs);
            }
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


        // Main getter for assets
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
                    let default_meta:AssetMeta = {
                        name: asset_id,
                        symbol: asset_id.substr(0,3),
                        denomination: 0
                    };

                    let coin_data = state.asset_meta[asset_id] || default_meta;

                    let assetObj = {
                        id: asset_id,
                        name: '',
                        symbol: '',
                        balance: asset_amount,
                        denomination: 0
                    };
                    assetObj.name = coin_data.name;
                    assetObj.symbol = coin_data.symbol.toUpperCase();
                    assetObj.denomination = coin_data.denomination;

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
        selectAddress(state, val){
            state.selectedAddress = val;
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
        refreshAddresses(store){
            store.state.addresses = keyChain.getAddressStrings();
            store.dispatch('updateUTXOs');
        },
        // Used in home page to access a user's wallet
        accessWallet(store, pk: string){
            let address = keyChain.importKey(pk);
            let keypair = keyChain.getKey(address);

            store.commit('setPrivateKey', pk);
            store.commit('selectAddress', keypair.getAddressString());
            store.commit('setAuth', true);
            store.dispatch('onAccess');

            router.push('/wallet/send');
        },

        onAccess(store){
            store.dispatch('refreshAddresses');
        },


        updateAssetsData(store){
            if(!store.state.utxo_set) return;
            let assets = store.state.utxo_set.getAssetIDs();

            for(var i=0; i<assets.length; i++){
                let asset_buf = assets[i];
                let asset_id = bintools.avaSerialize(asset_buf);

                avm.getAssetDescription(asset_buf).then(res => {
                    let name = res.name.trim();
                    let symbol = res.symbol.trim();
                    let denomination = res.denomination;

                    Vue.set(store.state.asset_meta, asset_id, {
                        name: name,
                        symbol: symbol,
                        denomination: denomination
                    });

                    // let asset = new AvaAsset(name, symbol, );
                    // console.log(asset);


                    // asset_names[asset_id] = {
                    //     name: res.name.trim(),
                    //     symbol: res.symbol.trim()
                    // }
                }).catch(err => {
                    console.log(err);
                });
            }
        },


        updateUTXOs(store){
            // console.log(store.state.addresses);
            // let addresses = avm.keyChain().getAddresses();
            // console.log(addresses,store.state.address)
            store.state.isUpdateBalance = true;
            avm.getUTXOs(store.state.addresses).then((res: UTXOSet) =>{
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


            let myAddresses = store.state.addresses;
            let toAddresses = [data.toAddress];
            let changeAddresses = data.changeAddresses;

            let asset = data.asset;
            let amount = data.amount;

            // convert big.js number to bn.js
            let multiplier = Big(10).pow(asset.denomination);
            let decimal = amount.times(multiplier);
            console.log(multiplier.toString());
            console.log(decimal.toString());

            let sendAmount = new BN(decimal.toFixed(0));
            // console.log(num.toString(10))
            //
            // console.log(num);
            // continue;

            console.log(changeAddresses);

            let assetId = asset.id;
            // let utxos = await avm.getUTXOs(myAddresses);
            let utxos = getAllUTXOsForAsset(assetId);
            // let sendAmount = new BN(data.amount);

            // console.log("issue tx");
            // console.log( sendAmount.toNumber(), assetId, utxos );
            // console.log(utxos);

            let unsigned_tx = await avm.makeUnsignedTx(utxos, sendAmount, toAddresses, myAddresses, changeAddresses, data.assetId);
            let signed_tx = avm.signTx(unsigned_tx);

            // console.log(signed_tx);
            // console.log(signed_tx.toBuffer().toString('hex'));


            let txid = await avm.issueTx(signed_tx);
            return txid;
        },


        removeKey(store, address:string){
            // console.log(address);

            let keyBuff = bintools.stringToAddress(address);
            // let keyBuff = bintools.avaDeserialize(address);
            let key = keyChain.getKey(keyBuff);
            keyChain.removeKey(key);

            console.log(key);
            let addresses = store.state.addresses;

            if(address === store.state.selectedAddress){
                for(var i=0; i<addresses.length;i++){
                    let addr = addresses[i];
                    if(address !== addr){
                        store.commit('selectAddress', addr);
                    }
                }
            }


            store.dispatch('Notifications/add', {
                title: 'Key Removed',
                message: 'The key belonging to this address is removed from your wallet.'
            });

            store.dispatch('refreshAddresses');
        },


        addKey(store, pk:string){

            let pkBuff = bintools.avaDeserialize(pk);
            let addrBuf = keyChain.importKey(pkBuff);
            let keypair = keyChain.getKey(addrBuf);

            store.dispatch('Notifications/add', {
                title: 'Key Added',
                message: 'The private key is added to the keychain.'
            });

            store.dispatch('refreshAddresses');
            return keypair;
        },

        async issueBatchTx(store, data:IssueBatchTxInput){

            console.log(data);
            let orders = data.orders;
            for(var i=0; i<orders.length; i++){
                let order = orders[i];

                // If no amount to send, skip it
                if(!order.amount) continue;


                await store.dispatch('issueTx', {
                    asset: order.asset,
                    // assetId: order.asset.id,
                    amount: order.amount,
                    toAddress: data.toAddress,
                    changeAddresses: data.changeAddresses
                }).then(()=>{
                    store.dispatch('Notifications/add', {
                        title: 'Transaction Sent',
                        message: 'You have succesfully sent your transaction.'
                    });
                }).catch(err => {
                    // alert(err);
                    store.dispatch('Notifications/add', {
                        title: 'Error Sending Transaction',
                        message: err,
                        color: '#f13939',
                        duration: 10000
                    });
                    return 'error';
                });
            }

            setTimeout(() => {
                store.dispatch('updateUTXOs');
            }, 5000);
            return 'success';
        },


        async exportKeyfile(store, pass){
            let salt = await cryptoHelpers.makeSalt();
            let passHash = await cryptoHelpers.pwhash(pass, salt);


            // Loop private keys, encrypt them and store in an array
            let keys = [];
            let addresses = store.state.addresses;
            for(var i=0; i<addresses.length; i++){
                let addr = addresses[i];
                let addBuf = bintools.stringToAddress(addr);
                let key = keyChain.getKey(addBuf);

                let pk = key.getPrivateKey();

                let pk_crypt = await cryptoHelpers.encrypt(pass,pk,salt);


                let key_data:KeyFileKey = {
                    key: bintools.avaSerialize(pk_crypt.ciphertext),
                    nonce: bintools.avaSerialize(pk_crypt.nonce),
                    address: addr
                }
                keys.push(key_data);
            }

            let file_data = {
                salt: bintools.avaSerialize(salt),
                pass_hash: bintools.avaSerialize(passHash.hash),
                keys: keys
            }

            // Download the file

            let text = JSON.stringify(file_data);


            let addr = store.state.selectedAddress.substr(2,5);
            let filename = `AVA_${addr}`;

            var blob = new Blob(
                [ text ],
                {
                    type : "application/json"
                }
            );
            let url = URL.createObjectURL( blob );
            var element = document.createElement('a');
            element.setAttribute('href', url);
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },


        // Given a key file with password, will try to decrypt the file and add keys to user's
        // key chain
        importKeyfile(store, data){
            let pass = data.password;
            let file = data.file;

            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                    reader.addEventListener('load', async () => {
                        let res = <string>reader.result;
                        try {
                            let json_data: KeyFile = JSON.parse(res);
                            // Check Password
                            let salt = bintools.avaDeserialize(json_data.salt);
                            let pass_hash = json_data.pass_hash;

                            let checkHash = await cryptoHelpers.pwhash(pass, salt);
                            let checkHashString = bintools.avaSerialize(checkHash.hash);

                            if (checkHashString !== pass_hash) {
                                reject({
                                    success: false,
                                    message: 'Invalid password.'
                                });
                            }


                            let keys = json_data.keys;
                            let keyStrings:string[] = [];
                            let keyAddresses:string[] = [];
                            for (var i = 0; i < keys.length; i++) {
                                let key_data = keys[i];

                                // let salt = bintools.avaDeserialize(key_data.salt);
                                let key = bintools.avaDeserialize(key_data.key);
                                let nonce = bintools.avaDeserialize(key_data.nonce);
                                let address = key_data.address;

                                let key_decrypt = await cryptoHelpers.decrypt(pass,key,salt,nonce);
                                let key_string = bintools.avaSerialize(key_decrypt);


                                keyAddresses.push(address);
                                keyStrings.push(key_string);
                            }

                            // If not auth, login user then add keys
                            if(!store.state.isAuth){
                                store.dispatch('accessWallet', keyStrings[0]).then(async ()=>{
                                    for(var i=1; i<keyStrings.length;i++){
                                        let key = keyStrings[i];
                                        let keypair = await store.dispatch('addKey', key);
                                        let pairAddress = keypair.getAddressString();

                                        if(pairAddress !== keyAddresses[i]){
                                            await store.dispatch('removeKey', pairAddress);
                                        }

                                    }
                                });
                            }else{
                                for(i=0; i<keyStrings.length;i++){
                                    let key = keyStrings[i];
                                    let keypair = await store.dispatch('addKey', key);
                                    let pairAddress = keypair.getAddressString();
                                    if(pairAddress !== keyAddresses[i]){
                                        await store.dispatch('removeKey', pairAddress);
                                    }
                                }
                            }

                            resolve({
                                success: true,
                                message: 'success'
                            })

                        }catch(err){
                            reject( {
                                success: false,
                                message: 'Unable to read key file.'
                            });
                        }
                    });
                reader.readAsText(file);
            });
        }
    },
})
