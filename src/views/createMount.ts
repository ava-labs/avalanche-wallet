import Vue from 'vue'
import store from '@/store'
import VueMeta from 'vue-meta'
import router from '@/router'
import Create from './Create.vue'
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import i18n from '@/plugins/i18n'
import BootstrapVue from 'bootstrap-vue'
import vuetify from '@/plugins/vuetify'

Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.component('datetime', Datetime)

export const mountCreateWallet = (el: string, appSuiteStore: any) => {
    const { setUpdateStore, navigate } = appSuiteStore
    const MyPlugin = {
        install(Vue, options) {
            Vue.prototype.globalHelper = () => {
                return {
                    updateSuiteStore: (store) => {
                        setUpdateStore(store)
                    },
                    navigate: (to: string) => {
                        navigate(to)
                    },
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
        render: (createElement) => {
            return createElement(Create)
        },
    })
    app.$mount(el)
}
