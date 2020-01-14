import Vue from 'vue'
import Vuex from 'vuex'

import Auth from './modules/auth/auth';
import {AssetType, RootState} from "@/store/types";
Vue.use(Vuex);

export default new Vuex.Store({
    modules:{
        Auth
    },
    state: {
        modals: {},
        assets: [
            {
                title: "Bitcoin",
                key: "BTC",
                balance: 37.34442,
                usd_price: 4.8,
                btc_price: 1,
                address: 'asdflhjv235adg'
            },
            {
                title: "Tether",
                key: "TTH",
                balance: 12.4700,
                usd_price: 4.8,
                btc_price: 2.8,
                address: 'asdfadsf24'
            },
            {
                title: "Ethereum",
                key: "ETH",
                balance: 32.554,
                usd_price: 4.8,
                btc_price: 2.8,
                address: 'klaubl3223rfa'
            },
            {
                title: "Doge Coin",
                key: "DGC",
                balance: 499.5,
                usd_price: 4.8,
                btc_price: 2.8,
                address: 'fasvnklkdvb;a'
            },
            {
                title: "Kyber",
                key: "KBC",
                balance: 21.9,
                usd_price: 4.8,
                btc_price: 2.8,
                address: 'vadfbhtrsgfbwer'
            },
            {
                title: "Gun Coin",
                key: "GNC",
                balance: 12,
                usd_price: 4.8,
                btc_price: 2.8,
                address: 'verhsdfgreynrtsd'
            },
            {
                title: "Collin Coin",
                key: "CLC",
                balance: 999,
                usd_price: 0.008,
                btc_price: 2.8,
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
        }
    },
    mutations: {

    },
    actions: {
        openModal(store, id: string){
            let modal = store.state.modals[id];
            if(modal){
                modal.open();
            }
        }
    },
})
