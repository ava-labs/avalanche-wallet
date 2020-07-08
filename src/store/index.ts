import Vue from 'vue'
import Vuex from 'vuex'

// import Auth from './modules/auth/auth';
import Assets from './modules/assets/assets';
import Network from './modules/network/network';
import Notifications from './modules/notifications/notifications';
import History from './modules/history/history';

import {
    RootState,
    IssueBatchTxInput, IWalletBalanceDict, SessionPersistFile, IWalletBalanceItem, IWalletAssetsDict
} from "@/store/types";

import {
    KeyFile, KeyFileDecrypted,
    KeyFileKey,
} from '@/js/IKeystore';

Vue.use(Vuex);

import router from "@/router";

import {ava, avm, bintools} from "@/AVA";
import AvaHdWallet from "@/js/AvaHdWallet";
import {AmountOutput, AVMKeyChain, AVMKeyPair} from "avalanche";
import AvaAsset from "@/js/AvaAsset";
import {makeKeyfile, readKeyFile} from "@/js/Keystore";
import AvaSingletonWallet from "@/js/AvaSingletonWallet";
import {wallet_type} from "@/js/IAvaHdWallet";
import {AvaWallet} from "@/js/AvaWallet";
import {AssetsDict} from "@/store/modules/assets/types";
import {keyToKeypair} from "@/helpers/helper";

export default new Vuex.Store({
    modules:{
        Assets,
        Notifications,
        Network,
        History
    },
    state: {
        isAuth: false,
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
            let wallet:AvaHdWallet|null = state.activeWallet;

            if(!wallet) return {};
            if(!wallet.getUTXOSet()) return {};

            let dict:IWalletBalanceDict = {};

            let addrUtxos = wallet.getUTXOSet().getAllUTXOs();

            for(var n=0; n<addrUtxos.length; n++){
                let utxo = addrUtxos[n];
                let utxoOut = utxo.getOutput() as AmountOutput;

                let amount = utxoOut.getAmount();
                let assetIdBuff = utxo.getAssetID();
                let assetId = bintools.avaSerialize(assetIdBuff);

                if(!dict[assetId]){
                    dict[assetId] = amount.clone();
                }else{
                    let amt = dict[assetId];
                    dict[assetId] = amt.add(amount)
                }
            }
            return dict;
        },
        // walletBalance(state: RootState, getters): IWalletBalanceItem[]{
        //     let balanceDict = getters.walletBalanceDict;
        //     let res:IWalletBalanceItem[] = [];
        //     for(var id in balanceDict){
        //         let amt = balanceDict[id]
        //         let item:IWalletBalanceItem = {
        //             id: id,
        //             amount: amt.clone()
        //         }
        //         res.push(item)
        //     }
        //     return res;
        // },

        // Get the balance dict, combine it with existing assets and return a new dict
        walletAssetsDict(state: RootState, getters): IWalletAssetsDict{
            let balanceDict:IWalletBalanceDict = getters.walletBalanceDict;

            // @ts-ignore
            let assetsDict:AssetsDict = state.Assets.assetsDict;
            let res:IWalletAssetsDict = {};

            for(var assetId in assetsDict){
                let balanceAmt = balanceDict[assetId];

                let asset:AvaAsset;
                if(!balanceAmt){
                    asset = assetsDict[assetId];
                    asset.resetBalance();
                }else{
                    asset = assetsDict[assetId];
                    asset.resetBalance();
                    asset.addBalance(balanceAmt)
                }
                res[assetId] = asset;
            }
            return res;
        },

        walletAssetsArray(state:RootState, getters):AvaAsset[]{
            let assetsDict:IWalletAssetsDict = getters.walletAssetsDict;
            let res:AvaAsset[] = [];

            for(var id in assetsDict){
                let asset = assetsDict[id];
                res.push(asset)
            }
            return res;
        },

        // walletType(state: RootState): wallet_type|null{
        //     if(state.activeWallet){
        //         return state.activeWallet.type;
        //     }
        //     return null;
        // },
        // externalAddresses(state: RootState): string[]{
        //     if(!state.activeWallet) return [];
        //     let addresses = state.activeWallet.getExternalKeyChain().getAddressStrings();
        //     return addresses;
        // },
        addresses(state: RootState): string[]{
            if(!state.activeWallet) return [];
            let addresses = state.activeWallet.getKeyChain().getAddressStrings();
            return addresses;
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
        async accessWallet({state, dispatch, commit}, key: AVMKeyPair): Promise<AvaHdWallet>{

            let wallet:AvaHdWallet = await dispatch('addWallet', key);
            await dispatch('activateWallet', wallet);

            state.isAuth = true;
            dispatch('onAccess');
            return wallet;
        },

        async accessWalletMultiple({state, dispatch, commit}, keys: AVMKeyPair[]){
            for(var i=0;i<keys.length;i++){
                let key = keys[i];
                let wallet:AvaHdWallet = await dispatch('addWallet', key);
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
            store.state.isAuth = false;


            // Clear Assets
            await store.dispatch('Assets/onlogout');

            // Clear session storage
            sessionStorage.removeItem('pks');

            // Clear local storage
            localStorage.removeItem('w');

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

        async addWallet({state, dispatch}, keypair:AVMKeyPair): Promise<AvaHdWallet>{
            let wallet = new AvaHdWallet(keypair);

            state.wallets.push(wallet);



            return wallet;
        },

        removeWallet({state,dispatch}, wallet:AvaHdWallet){
            let index = state.wallets.indexOf(wallet);
            state.wallets.splice(index,1);

        },

        async rememberWallets({state, dispatch}, pass: string|undefined){
            if(!pass) return;


            let wallets = state.wallets;

            let file = await makeKeyfile(wallets,pass);
            let fileString = JSON.stringify(file);
            localStorage.setItem('w', fileString);

            console.log('remember', file);

            dispatch('Notifications/add', {
                title: "Remember Wallet",
                message: "Wallets are stored securely for easy access.",
                type: "info"
            });
        },

        async issueBatchTx({state}, data:IssueBatchTxInput){
            let wallet = state.activeWallet;
            if(!wallet) return 'error';

            let toAddr = data.toAddress;
            let orders = data.orders;
            try{
                let txId:string = await wallet.issueBatchTx(orders, toAddr);
                return 'success';
            }catch(e) {
                console.log(e);
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
            let wallets = state.wallets;
            let file_data = await makeKeyfile(wallets,pass);

            // Download the file

            let text = JSON.stringify(file_data);
            let addr = file_data.keys[0].address.substr(2,5);

            let utcDate = new Date()
            let dateString = utcDate.toISOString().replace(' ', '_');
            let filename = `AVAX_${dateString}.json`;

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

                            let keyFile:KeyFileDecrypted = await readKeyFile(json_data,pass);

                            let keys = keyFile.keys;

                            // let inputData: AVMKeyPair[] = keys.map(val => {
                            //     return {
                            //         pk: val.key,
                            //         type: val.type
                            //     }
                            // });

                            let chainID = avm.getBlockchainAlias();
                            let inputData:AVMKeyPair[] = keys.map(key => {
                                return keyToKeypair(key.key,chainID);
                                // let addr = keychain.importKey(key.key);
                                // return keychain.getKey(addr);
                            });

                            // If not auth, login user then add keys
                            if(!store.state.isAuth){
                                await store.dispatch('accessWalletMultiple', inputData);
                            }else{
                                for(let i=0; i<inputData.length;i++){
                                    let key = inputData[i];
                                    await store.dispatch('addWallet', key);
                                }
                            }

                            resolve({
                                success: true,
                                message: 'success'
                            })

                        }catch(err){
                            reject(err);
                        }
                    });
                reader.readAsText(file);
            });
        }
    },
})
