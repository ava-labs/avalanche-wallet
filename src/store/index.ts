import Vue from 'vue'
import Vuex from 'vuex'

// import Auth from './modules/auth/auth';
import Assets from './modules/assets/assets';
import Notifications from './modules/notifications/notifications';
import {
    RootState,
    IssueTxInput,
    KeyFile,
    KeyFileKey,
    IssueBatchTxInput
} from "@/store/types";
Vue.use(Vuex);

import router from "@/router";

import {avm, bintools, cryptoHelpers, keyChain} from "@/AVA";

export default new Vuex.Store({
    modules:{
        Assets,
        Notifications
    },
    state: {
        isAuth: false,
        privateKey: '',
        addresses: [],
        selectedAddress: '',
        modals: {},
    },
    getters: {
        isAuthenticated(state: RootState){
            if(state.privateKey != '') return true;
            else return false;
        },

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
        }
    },
    actions: {
        // Gets addresses from the keys in the keychain,
        // Useful after entering wallet, adding/removing new keys
        refreshAddresses(store){
            store.state.addresses = keyChain.getAddressStrings();
            store.dispatch('Assets/updateUTXOs');
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

        async logout(store){



            // Delete keys
            store.dispatch('removeAllKeys');
            await store.dispatch('Notifications/add', {
                title: 'Logout',
                message: 'You have successfully logged out of your wallet.'
            });

            // Remove other data
            store.state.selectedAddress = '';
            store.state.privateKey =  '';
            store.state.isAuth = false;

            // Clear Assets
            await store.dispatch('Assets/onlogout');

            console.log(store.state);
            console.log(avm)
            router.push('/');
        },


        // used with logout
        async removeAllKeys(store){
            let addrs = store.state.addresses;
          for(var i=addrs.length-1; i >= 0; i--){
              let addr = store.state.addresses[i];
              await store.dispatch('removeKey', addr);
          }
        },

        removeKey(store, address:string){

            let keyBuff = bintools.stringToAddress(address);
            let key = keyChain.getKey(keyBuff);
            keyChain.removeKey(key);

            let addresses = store.state.addresses;

            if(address === store.state.selectedAddress){
                for(var i=0; i<addresses.length;i++){
                    let addr = addresses[i];
                    if(address !== addr){
                        store.commit('selectAddress', addr);
                        break;
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

        async issueTx(store, data:IssueTxInput){
            let myAddresses = store.state.addresses;
            let toAddresses = [data.toAddress];
            let changeAddresses = data.changeAddresses;

            let asset = data.asset;
            let amount = data.amount;

            let assetId = asset.id;

            console.log(amount.toString(10));


            let utxos = await store.dispatch('Assets/getAllUTXOsForAsset', assetId);
            let unsigned_tx = await avm.makeUnsignedTx(utxos, amount, toAddresses, myAddresses, changeAddresses, assetId);
            let signed_tx = avm.signTx(unsigned_tx);

            let txid = await avm.issueTx(signed_tx);
            return txid;
        },

        async issueBatchTx(store, data:IssueBatchTxInput){
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
                store.dispatch('Assets/updateUTXOs');
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
