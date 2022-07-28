import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import Home from '../views/Home.vue'

import Transfer from '@/views/wallet/Transfer.vue'
import ManageKeys from '@/views/wallet/ManageKeys.vue'
import Menu from '../views/access/Menu.vue'
import Keystore from '../views/access/Keystore.vue'
import Mnemonic from '@/views/access/Mnemonic.vue'
import PrivateKey from '@/views/access/PrivateKey.vue'
import Access from '../views/access/Access.vue'
import Create from '@/views/Create.vue'
import Wallet from '@/views/Wallet.vue'
import WalletHome from '@/views/wallet/Portfolio.vue'
import Earn from '@/views/wallet/Earn.vue'
import Advanced from '@/views/wallet/Advanced.vue'
import Activity from '@/views/wallet/Activity.vue'
import Account from '@/views/access/Account.vue' // your vuex store
import Launch from '@/views/wallet/Launch.vue'
import Legal from '@/views/Legal.vue'
import store from '../store/index'
import Studio from '@/views/wallet/Studio.vue'
import Export from '@/views/wallet/CrossChain.vue'

Vue.use(VueRouter)

const ifNotAuthenticated = (to: Route, from: Route, next: Function) => {
    if (!store.state.isAuth) {
        next()
        return
    }
    next('/wallet')
}

const ifAuthenticated = (to: Route, from: Route, next: Function) => {
    if (store.state.isAuth) {
        next()
        return
    }
    next('/')
}

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/access',
        children: [
            {
                path: '/',
                name: 'access',
                component: Menu,
            },
            {
                path: 'keystore',
                component: Keystore,
            },
            {
                path: 'privatekey',
                component: PrivateKey,
            },
            {
                path: 'mnemonic',
                component: Mnemonic,
            },
            {
                path: 'account/:index',
                component: Account,
                name: 'Account',
            },
        ],
        component: Access,
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/legal',
        name: 'legal',
        component: Legal,
    },
    {
        path: '/create',
        name: 'create',
        component: Create,
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/wallet',
        children: [
            {
                path: '/',
                name: 'wallet',
                component: WalletHome,
            },
            {
                path: 'transfer',
                component: Transfer,
            },
            {
                path: 'cross_chain',
                component: Export,
            },
            {
                path: 'keys',
                component: ManageKeys,
            },
            {
                path: 'earn',
                component: Earn,
            },
            {
                path: 'studio',
                component: Studio,
            },
            {
                path: 'advanced',
                component: Advanced,
            },
            {
                path: 'activity',
                component: Activity,
            },
            {
                path: 'launch',
                component: Launch,
            },
        ],
        component: Wallet,
        beforeEnter: ifAuthenticated,
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

export default router
