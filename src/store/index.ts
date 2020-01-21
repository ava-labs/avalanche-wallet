import Vue from 'vue'
import Vuex from 'vuex'

import Auth from './modules/auth/auth';
import {AssetType, RootState} from "@/store/types";
Vue.use(Vuex);


import {AVAAssets, binTools} from "@/AVA";


export default new Vuex.Store({
    modules:{
        Auth
    },
    state: {
        utxos: {},
        isAuth: false,
        privateKey: '',
        // publicKey: '',
        address: '',
        modals: {},
        assets: [
            {
                title: "Avalanche",
                key: "AVA",
                balance: 23097.34442,
                usd_price: 0.08,
                btc_price: 0.4311,
                ava_price: 1,
                address: 'asdflhjv235adg'
            },
            {
                title: "Stephen Coin",
                key: "SJB",
                balance: 4782,
                usd_price: 127.43,
                btc_price: 0.9311,
                ava_price: 189,
                address: 'asdflhjv235adg'
            },
            {
                title: "Bitcoin",
                key: "BTC",
                balance: 37.34442,
                usd_price: 4.8,
                btc_price: 1,
                ava_price: 19400,
                address: 'asdflhjv235adg'
            },
            {
                title: "Tether",
                key: "TTH",
                balance: 12.4700,
                usd_price: 4.8,
                btc_price: 2.8,
                ava_price: 1.2,
                address: 'asdfadsf24'
            },
            {
                title: "Ethereum",
                key: "ETH",
                balance: 32.554,
                usd_price: 4.8,
                btc_price: 2.8,
                ava_price: 1,
                address: 'klaubl3223rfa'
            },
            {
                title: "Doge Coin",
                key: "DGC",
                balance: 499.5,
                usd_price: 4.8,
                btc_price: 2.8,
                ava_price: 1,
                address: 'fasvnklkdvb;a'
            },
            {
                title: "Kyber",
                key: "KBC",
                balance: 21.9,
                usd_price: 4.8,
                btc_price: 2.8,
                ava_price: 1,
                address: 'vadfbhtrsgfbwer'
            },
            {
                title: "Gun Coin",
                key: "GNC",
                balance: 12,
                usd_price: 4.8,
                btc_price: 2.8,
                ava_price: 1,
                address: 'verhsdfgreynrtsd'
            },
            {
                title: "Collin Coin",
                key: "CLC",
                balance: 999,
                usd_price: 0.008,
                btc_price: 2.8,
                ava_price: 1,
                address: 'sldkhfgvoiuglg97i'
            }
        ],
        tx_history: [
            {
                id: "aafjkdbsflkjv34",
                asset: 'BTC',
                amount: 2.4,
                to: 'BKAJVLJK239DSFBBJ',
                date: new Date(),
                status: 'complete'
            },
            {
                id: "aljahsvdfljhc34",
                asset: 'ETH',
                amount: 2.4,
                to: 'BKAJVLJK239DSFBBJ',
                date: new Date(),
                status: 'complete'
            },
            {
                id: "akasjdvflkhvl23",
                asset: 'GGC',
                amount: 2.4,
                to: 'BKAJVLJK239DSFBBJ',
                date: new Date(),
                status: 'complete'
            },
            {
                id: "aaklsdjvflasdvf",
                asset: 'CKM',
                amount: 2.4,
                to: 'BKAJVLJK239DSFBBJ',
                date: new Date(),
                status: 'complete'
            },
            {
                id: "savlvhl3h4f3",
                asset: 'KYB',
                amount: 2.4,
                to: 'BKAJVLJK239DSFBBJ',
                date: new Date(),
                status: 'complete'
            },
        ]
    },
    getters: {
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
        balance(state: RootState){

            let res = {};
            for(var id in state.utxos){
                let utxo = state.utxos[id];

                let asset_id = utxo.getAssetID();
                    asset_id = binTools.bufferToB58(asset_id);

                let asset_amount = utxo.getAmount();
                    asset_amount = asset_amount.toNumber()

                if(res[asset_id]){
                    res[asset_id].balance += asset_amount;
                }else{
                    res[asset_id] = {
                        title: asset_id,
                        key: asset_id.substr(0,3),
                        balance: asset_amount,
                        usd_price: 0.08,
                        btc_price: 0.4311,
                        ava_price: 1,
                    };
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
        // setPublicKey(state,val){
        //     state.publicKey = val;
        // },
    },
    actions: {
        // Used in home page to access a user's wallet
        accessWallet(store, pk: string){
            console.log(pk);
            let keyChain = AVAAssets.keyChain();
            let privateKeyBuf = binTools.avaDeserialize(pk);
            let address = keyChain.importKey(privateKeyBuf);

            console.log("YO");

            store.commit('setPrivateKey', pk);
            store.commit('setAddress', address);
            store.commit('setAuth', true);
            store.dispatch('onAccess');
        },

        onAccess(store){
            console.log("onAccess");
            console.log(store.state.privateKey);

            AVAAssets.GetUTXOs([store.state.address]).then(res =>{
                console.log(res);
                let utxos = res.getAllUTXOs();
                store.commit('setUTXOs', utxos);
            });
        },

        openModal(store, id: string){
            let modal = store.state.modals[id];
            if(modal){
                modal.open();
            }
        }
    },
})
