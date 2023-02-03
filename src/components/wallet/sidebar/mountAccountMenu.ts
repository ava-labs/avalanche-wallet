import Vue from 'vue'
import store from '@/store'
import VueMeta from 'vue-meta'
import router from '@/router'

import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import i18n from '@/plugins/i18n'
import BootstrapVue from 'bootstrap-vue'
import vuetify from '@/plugins/vuetify'

import AccountUserItem from './AccountUserItem.vue'
import AccountKycItem from './AccountKycItem.vue'
import AccountCard from './AccountCard.vue'

Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.component('datetime', Datetime)

function selectAccountMenuItem(type: string) {
    switch (type) {
        case 'kyc':
            return AccountKycItem
        case 'user':
            return AccountUserItem
        default:
            return AccountCard
    }
}

export const mountAccountMenu = (el: string, props: any) => {
    const app = new Vue({
        router,
        store,
        vuetify,
        i18n,
        data: {},
        created: function () {},
        render: (createElement) => {
            const context = {
                props: props,
            }
            return createElement(selectAccountMenuItem(props.type), context)
        },
    })
    app.$mount(el)
}
