import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

import Ava from '../views/wallet/Ava.vue';
import Assets from '../views/wallet/Assets.vue';
import History from '../views/wallet/History.vue';

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
        path: '/wallet',
        name: 'wallet',
        children: [
            {
                path: 'ava',
                component: Ava
            },
            {
                path: 'assets',
                component: Assets
            },
            {
                path: 'history',
                component: History
            }
        ],
        component: () => import(/* webpackChunkName: "login" */ '../views/Wallet.vue')
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
