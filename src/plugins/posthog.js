import posthog from 'posthog-js'

const POSTHOG_DEV_HOST_URL = 'https://data-posthog.avax-test.network'
const POSTHOG_PROD_HOST_URL = 'https://data-posthog.avax.network'
const POSTHOG_PROD_APP_ID = 'phc_dsxZ9Sx4KJZzJ6lmmC4HsjfSiabf9GXCDT3KISLcx1z'
const POSTHOG_DEV_APP_ID = 'phc_si74ysjD7dwogel1tA4FJmU2IrlrqKiTg3KNBDmeWA0'

export default {
    install(Vue, options) {
        Vue.prototype.$posthog = posthog.init(POSTHOG_DEV_APP_ID, {
            api_host: POSTHOG_DEV_HOST_URL,
        })
    },
}
