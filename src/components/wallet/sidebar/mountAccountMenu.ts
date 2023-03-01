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
import AliasPicker from '../manage/AliasPicker.vue'

Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.component('datetime', Datetime)

function selectAccountMenuItem(type: string) {
    switch (type) {
        case 'alias':
            return AliasPicker
        case 'kyc':
            return AccountKycItem
        case 'user':
            return AccountUserItem
        default:
            return AccountCard
    }
}

export const mountAccountMenu = (el: string, props: any) => {
    const { setAccount, dispatchNotification } = props
    const MyPlugin = {
        install(Vue) {
            Vue.prototype.globalHelper = () => {
                return {
                    setAccount: (acc) => setAccount(acc),
                    dispatchNotification: (params) => dispatchNotification(params),
                }
            }
        },
    }
    Vue.use(MyPlugin)
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
