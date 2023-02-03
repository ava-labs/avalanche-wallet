import Vue from 'vue'
import store from './store'
import VueMeta from 'vue-meta'
import router from './router'
import Home from './views/Home.vue'
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import i18n from './plugins/i18n'
import BootstrapVue from 'bootstrap-vue'
import vuetify from '@/plugins/vuetify'

Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.component('datetime', Datetime)

export const mountHome = (el: string, props: any) => {
    const app = new Vue({
        router,
        store,
        vuetify,
        i18n,
        data: {},
        render: (createElement) => {
            const context = { props: props }
            return createElement(Home, context)
        },
    })
    app.$mount(el)
}

// mount("#app");
