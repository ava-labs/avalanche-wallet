import Vue from 'vue'
import store from '@/store'
import VueMeta from 'vue-meta'
import router from '@/router'

import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import i18n from '@/plugins/i18n'
import BootstrapVue from 'bootstrap-vue'
import vuetify from '@/plugins/vuetify'
import MyKeys from '@/components/wallet/manage/MyKeys.vue'
Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.component('datetime', Datetime)

export const mountKyesComponent = (el: string, props: any) => {
    const { dispatchNotification } = props
    const MyPlugin = {
        install(Vue) {
            Vue.prototype.globalHelper = () => {
                return {
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
            return createElement(MyKeys, context)
        },
    })
    app.$mount(el)
}
