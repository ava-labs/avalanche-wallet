import Vue from 'vue'
import Vuex from 'vuex'

// import Auth from './modules/auth/auth';
import Assets from './modules/assets/assets';
import Network from './modules/network/network';
import Notifications from './modules/notifications/notifications';
import History from './modules/history/history';

import {
    RootState,
    IssueTxInput,
    KeyFile,
    KeyFileKey,
    IssueBatchTxInput, IWalletBalanceDict
} from "@/store/types";
Vue.use(Vuex);

import router from "@/router";

import {ava, avm, bintools, cryptoHelpers, keyChain} from "@/AVA";
import slopes from "slopes/typings/src/slopes";
import AvaHdWallet from "@/js/AvaHdWallet";
import {AmountOutput, AVMKeyPair} from "slopes";
import AvaAsset from "@/js/AvaAsset";

export default new Vuex.Store({
    modules:{
        Assets,
        Notifications,
        Network,
        History
    },
    state: {
        isAuth: false,
        rememberKey: false, // if true the keytore will remember keys during browser session
        privateKey: '',
        addresses: [],
        selectedAddress: '',
        modals: {},
        activeWallet: null,
        address: null,
        wallets: [],
        isLoadingPersistKeys: false, // true if currently loading the saved keys
    },
    getters: {
        walletBalanceDict(state: RootState): IWalletBalanceDict{
            let wallet = state.activeWallet;

            if(!wallet) return {};
            if(!wallet.utxoset) return {};

            let res: IWalletBalanceDict = {};
            let walletBalance:IWalletBalanceDict = {};

            // @ts-ignore
            let assetsDict = state.Assets.assetsDict;

            let addrUtxos = wallet.utxoset.getAllUTXOs();
            for(var n=0; n<addrUtxos.length; n++){
                let utxo = addrUtxos[n];
                let utxoOut = utxo.getOutput() as AmountOutput;

                let amount = utxoOut.getAmount();
                let assetIdBuff = utxo.getAssetID();
                let assetId = bintools.avaSerialize(assetIdBuff);

                let assetObj:AvaAsset|undefined = assetsDict[assetId];
                if(!assetObj) continue;

                let asset = walletBalance[assetId];
                if(!asset){
                    let name = assetObj.name;
                    let symbol = assetObj.symbol;
                    let denomination = assetObj.denomination;

                    let newAsset = new AvaAsset(assetId,name,symbol,denomination);
                    newAsset.addBalance(amount);

                    walletBalance[assetId] = newAsset;
                }else{
                    asset.addBalance(amount)
                }
            }

            for(var assetId in assetsDict){
                let asset;
                if(!walletBalance[assetId]){
                    asset = assetsDict[assetId];
                }else{
                    asset = walletBalance[assetId];
                }
                res[assetId] = asset;
            }

            return res;
        },
        walletBalance(state: RootState, getters): AvaAsset[]{
            let balanceDict = getters.walletBalanceDict;
            let res:AvaAsset[] = [];
            for(var id in balanceDict){
                res.push(balanceDict[id])
            }
            return res;

        },
        appReady(state: RootState, getters){
            let avaAsset = getters['Assets/AssetAVA'];

            if(!avaAsset) return false;
            return true;
        },
        activeKey(state): AVMKeyPair|null{
            if(!state.activeWallet){
                return null;
            }
            return state.activeWallet.getCurrentKey();
        }
    },
    mutations: {
        selectAddress(state, val){
            state.selectedAddress = val;
        },
        updateActiveAddress(state){
            if(!state.activeWallet){
                state.address = null;
            }else{
                let keynow = state.activeWallet.getCurrentKey();
                state.address = keynow.getAddressString();
            }
        }
    },
    actions: {
        // Used in home page to access a user's wallet
        // Used to access wallet with a single key
        async accessWallet({state, dispatch, commit}, pk: string){

            let wallet:AvaHdWallet = await dispatch('addWallet', pk);

            await dispatch('activateWallet', wallet);

            state.isAuth = true;
            dispatch('onAccess');
        },

        async accessWalletMultiple({state, dispatch, commit}, pks: string[]){
            for(var i=0;i<pks.length;i++){
                let pk = pks[i];
                let wallet:AvaHdWallet = await dispatch('addWallet', pk);
            }
            await dispatch('activateWallet', state.wallets[0]);

            state.isAuth = true;
            dispatch('onAccess');
        },

        onAccess(store){
            router.push('/wallet');
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

            // Clear session storage
            sessionStorage.removeItem('pks');

            router.push('/');
        },


        // used with logout
        async removeAllKeys({state, dispatch}){
            let wallets = state.wallets;

            for(var i=0; i<wallets.length;i++){
                let wallet = wallets[i];
                await dispatch('removeWallet', wallet);

                dispatch('Notifications/add', {
                    title: 'Key Removed',
                    message: 'Private key and assets removed from the wallet.'
                });
            }

          //   let addrs = state.addresses;
          // for(var i=addrs.length-1; i >= 0; i--){
          //     let addr = state.addresses[i];
          //     await dispatch('removeKey', addr);
          // }
        },

        async addWallet({state, dispatch}, pk:string): Promise<AvaHdWallet>{

            let pkBuff = bintools.avaDeserialize(pk);
            let addrBuf = keyChain.importKey(pkBuff);
            let keypair = keyChain.getKey(addrBuf);


            // Create new HD Wallet for the key
            let hdWallet = new AvaHdWallet(keypair);

            state.wallets.push(hdWallet);

            // state.addresses = keyChain.getAddressStrings();

            if(state.rememberKey){
                dispatch('saveKeys');
            }


            return hdWallet;
        },

        removeWallet({state,dispatch}, wallet:AvaHdWallet){
            let masterKey = wallet.masterKey;
            keyChain.removeKey(masterKey);

            let index = state.wallets.indexOf(wallet);
            state.wallets.splice(index,1);

            if(state.rememberKey){
                dispatch('saveKeys');
            }
        },

        // Saves current keys to browser Session Storage
        async saveKeys({state, dispatch}){
            let wallets = state.wallets;

            let keys: string[] = [];


            wallets.forEach(wallet => {
               let key = wallet.masterKey;
               let pk = key.getPrivateKeyString();
                keys.push(pk);

            });

            let saveData = JSON.stringify(keys);
            sessionStorage.setItem('pks', saveData);
        },



        // Tries to read the session storage and add keys to the wallet
        async autoAccess({state, dispatch}){
            let sessionKeys = sessionStorage.getItem('pks');
            if(!sessionKeys) return;

            state.isLoadingPersistKeys = true;

            // await Vue.nextTick();

            try{

                let rawKeys = JSON.parse(sessionKeys);

                await dispatch('accessWalletMultiple', rawKeys);
                state.rememberKey = true;
                state.isLoadingPersistKeys = false;
                return true;
            }catch (e) {
                console.log(e);
                state.isLoadingPersistKeys = false;
                return false;
            }
        },

        async issueBatchTx({state}, data:IssueBatchTxInput){
            let wallet = state.activeWallet;
            if(!wallet) return 'error';

            let toAddr = data.toAddress;
            let orders = data.orders;
            try{
                let txIds = await wallet.issueBatchTx(orders, toAddr);
                return 'success';
            }catch(e) {
                return 'error';
            }
        },


        async activateWallet({state, dispatch, commit}, wallet:AvaHdWallet){
            state.activeWallet = wallet;
            state.selectedAddress = wallet.getCurrentAddress();

            commit('updateActiveAddress');
            dispatch('History/updateTransactionHistory');
        },


        async exportKeyfile({state}, pass){
            let salt = await cryptoHelpers.makeSalt();
            let passHash = await cryptoHelpers.pwhash(pass, salt);


            // Loop private keys, encrypt them and store in an array
            let keys = [];

            for(var i=0; i<state.wallets.length;i++){
                let wallet = state.wallets[i];
                let pk = wallet.masterKey.getPrivateKey();
                let addr = wallet.masterKey.getAddressString();

                let pk_crypt = await cryptoHelpers.encrypt(pass,pk,salt);

                let key_data:KeyFileKey = {
                    key: bintools.avaSerialize(pk_crypt.ciphertext),
                    nonce: bintools.avaSerialize(pk_crypt.nonce),
                    address: addr
                }
                keys.push(key_data);
            }

            const KEYSTORE_VERSION = '2.0';


            let file_data = {
                salt: bintools.avaSerialize(salt),
                pass_hash: bintools.avaSerialize(passHash.hash),
                keys: keys,
                version: KEYSTORE_VERSION
            };

            // Download the file

            let text = JSON.stringify(file_data);


            let addr = state.selectedAddress.substr(2,5);
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
                                await store.dispatch('accessWalletMultiple', keyStrings);
                            }else{
                                for(i=0; i<keyStrings.length;i++){
                                    let key = keyStrings[i];
                                    let keypair = await store.dispatch('addWallet', key);
                                    // let pairAddress = keypair.getAddressString();
                                    // if(pairAddress !== keyAddresses[i]){
                                    //     await store.dispatch('removeKey', pairAddress);
                                    // }
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
