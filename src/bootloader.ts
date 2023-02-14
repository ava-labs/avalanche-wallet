import Vue from 'vue'
import store from './store'
import VueMeta from 'vue-meta'
import router from './router'
import App from './App.vue'
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import i18n from './plugins/i18n'
import BootstrapVue from 'bootstrap-vue'
import vuetify from '@/plugins/vuetify'

Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.component('datetime', Datetime)

export const mount = (el: string, appSuiteStore: any) => {
    const { setUpdateStore, setLogOut, setAccount } = appSuiteStore
    const MyPlugin = {
        install(Vue) {
            Vue.prototype.globalHelper = () => {
                return {
                    updateSuiteStore: (s) => setUpdateStore(s),
                    logout: () => setLogOut(true),
                    setAccount: (acc) => setAccount(acc),
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
        render: (createElement) => {
            return createElement(App)
        },
        mounted() {
            // Reveal app version
            // Hide loader once vue is initialized
            let loader = document.getElementById('app_loading')
            if (loader) {
                loader.style.display = 'none'
            }
        },
        data: {
            theme: 'night',
        },
    })
    app.$mount(el)
}

// mount("#app");

// @ts-ignore
if (window.Cypress) {
    // only available during E2E tests
    // @ts-ignore
    window.app = app
}

// Extending Big.js with a helper function
import Big from 'big.js'

declare module 'big.js' {
    interface Big {
        toLocaleString(toFixed?: number): string
    }
}

Big.prototype.toLocaleString = function (toFixed: number = 9) {
    let value = this

    let fixedStr = this.toFixed(toFixed)
    let split = fixedStr.split('.')
    let wholeStr = parseInt(split[0])
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '\u2005')

    if (split.length === 1) {
        return wholeStr
    } else {
        let remainderStr = split[1]

        // remove trailing 0s
        let lastChar = remainderStr.charAt(remainderStr.length - 1)
        while (lastChar === '0') {
            remainderStr = remainderStr.substring(0, remainderStr.length - 1)
            lastChar = remainderStr.charAt(remainderStr.length - 1)
        }

        let trimmed = remainderStr.substring(0, toFixed)
        if (!trimmed) return wholeStr
        return `${wholeStr}.${trimmed}`
    }
}
