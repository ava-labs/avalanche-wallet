import Vue from 'vue'
import Vuex from 'vuex'

import Auth from './modules/auth/auth';
Vue.use(Vuex);

export default new Vuex.Store({
    modules:{
        Auth
    },
    state: {
        assets: [
            {
                title: "Bitcoin",
                key: "BTC",
                balance: 37.34442,
                address: 'asdflhjv235adg'
            },
            {
                title: "Tether",
                key: "TTH",
                balance: 12.4700,
                address: 'asdfadsf24'
            },
            {
                title: "Ethereum",
                key: "ETH",
                balance: 32.554,
                address: 'klaubl3223rfa'
            },
            {
                title: "Doge Coin",
                key: "DGC",
                balance: 482999.5,
                address: 'fasvnklkdvb;a'
            },
            {
                title: "Kyber",
                key: "KBC",
                balance: 21.9,
                address: 'vadfbhtrsgfbwer'
            },
            {
                title: "Gun Coin",
                key: "GNC",
                balance: 12,
                address: 'verhsdfgreynrtsd'
            },
            {
                title: "Collin Coin",
                key: "CLC",
                balance: 99999,
                address: 'sldkhfgvoiuglg97i'
            }
        ]
    },
    mutations: {

    },
    actions: {

    },
})
