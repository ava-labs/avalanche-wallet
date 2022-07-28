import Vue from 'vue'
import VueMeta from 'vue-meta'
import App from './App.vue'
import router from './router'
import store from './store'
//@ts-ignore
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'

Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.component('datetime', Datetime)

Vue.config.productionTip = false

const app = new Vue({
    router,
    store,
    vuetify,
    i18n,
    render: (h) => h(App),
    created: () => {
        store.commit('Accounts/loadAccounts')
        if (store.getters['Accounts/hasAccounts'] > 0) router.replace('/access')
    },
    mounted() {
        // Reveal app version
        console.log(`App Version: ${process.env.VUE_APP_VERSION}`)
        // Hide loader once vue is initialized
        let loader = document.getElementById('app_loading')
        if (loader) {
            loader.style.display = 'none'
        }
    },
    data: {
        theme: 'day',
    },
}).$mount('#app')

// @ts-ignore
if (window.Cypress) {
    // only available during E2E tests
    // @ts-ignore
    window.app = app
}

// Extending Big.js with a helper function
import Big from 'big.js'
import BootstrapVue from 'bootstrap-vue'

declare module 'big.js' {
    interface Big {
        toLocaleString(toFixed?: number): string
    }
}

Big.prototype.toLocaleString = function (toFixed: number = 9) {
    let value = this

    let fixedStr = this.toFixed(toFixed)
    let split = fixedStr.split('.')
    let wholeStr = parseInt(split[0]).toLocaleString('en-US')

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
