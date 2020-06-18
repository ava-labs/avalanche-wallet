import Vue from 'vue'
import VueRouter, {Route} from 'vue-router'
import Home from '../views/Home.vue'

import Ava from '../views/wallet/Ava.vue';

import Transfer from '@/components/wallet/transfer/Transfer.vue';
// import Assets from '../views/wallet/Assets.vue';
import History from '../views/wallet/History.vue';
// import Transfer from '../views/wallet/Transfer.vue';
import Advanced from '@/components/wallet/advanced/Advanced.vue';
import ManageKeys from '@/components/wallet/keys/ManageKeys.vue';

Vue.use(VueRouter);


import store from '../store/index' // your vuex store
import WalletHome from "@/views/wallet/Home.vue";


const ifNotAuthenticated = (to: Route, from: Route, next: Function) => {
    if (!store.state.isAuth) {
        next();
        return
    }
    next('/wallet')
};

const ifAuthenticated = (to: Route, from: Route, next: Function) => {
    if (store.state.isAuth) {
        next();
        return
    }
    next('/')
};


const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        beforeEnter: ifNotAuthenticated
    },
    {
        path: '/access',
        children: [
            {
                path: '/',
                name: 'access',
                component: () => import(/* webpackChunkName: "access_pk" */ '../views/access/Menu.vue'),
            },
            {
                path: 'private_key',
                component: () => import(/* webpackChunkName: "access_pk" */ '../views/access/AccessString.vue'),
            },
            {
                path: 'keystore',
                component: () => import(/* webpackChunkName: "access_file" */ '../views/access/Keystore.vue'),
            },
            {
                path: 'mnemonic',
                component: () => import(/* webpackChunkName: "access_file" */ '../views/access/Mnemonic.vue'),
            }
        ],
        component: () => import(/* webpackChunkName: "about" */ '../views/access/Access.vue'),
        beforeEnter: ifNotAuthenticated
    },
    {
        path: '/create',
        name: 'create',
        component: () => import(/* webpackChunkName: "about" */ '../views/Create.vue'),
        beforeEnter: ifNotAuthenticated
    },
    {
        path: '/wallet',
        children: [
            {
                path: '/',
                name: 'wallet',
                component: WalletHome
            },
            {
                path: 'transfer',
                component: Transfer
            },
            {
                path: 'keys',
                component: ManageKeys
            },
            {
                path: 'advanced',
                component: Advanced
            }
        ],
        component: () => import(/* webpackChunkName: "login" */ '../views/Wallet.vue'),
        beforeEnter: ifAuthenticated
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router
