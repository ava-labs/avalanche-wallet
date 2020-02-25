import Vue from 'vue'
import VueRouter, {Route} from 'vue-router'
import Home from '../views/Home.vue'

import Ava from '../views/wallet/Ava.vue';

import Transfer from '@/components/wallet/Transfer.vue';
// import Assets from '../views/wallet/Assets.vue';
import History from '../views/wallet/History.vue';
// import Transfer from '../views/wallet/Transfer.vue';
import Advanced from '@/components/wallet/advanced/Advanced.vue';
import ManageKeys from '@/components/wallet/keys/ManageKeys.vue';

Vue.use(VueRouter);


import store from '../store/index' // your vuex store

const ifNotAuthenticated = (to: Route, from: Route, next: Function) => {
    if (!store.getters.isAuthenticated) {
        next();
        return
    }
    next('/wallet')
};

const ifAuthenticated = (to: Route, from: Route, next: Function) => {
    if (store.getters.isAuthenticated) {
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
    // {
    //     path: '/about',
    //     name: 'about',
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    // },
    {
        path: '/wallet',
        name: 'wallet',
        children: [
            {
                path: 'send',
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
