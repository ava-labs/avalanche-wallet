import posthog from 'posthog-js'

const POSTHOG_DEV_APP_ID = 'phc_6HUmT6KtEAPlKpIw9lKf6mpIog3YU1ClbcylLudAcb0'
const POSTHOG_DEV_HOST_URL = 'https://proxy-api.avax.network/ph'

export default {
    install(Vue, options) {
        Vue.prototype.$posthog = posthog.init(POSTHOG_DEV_APP_ID, {
            loaded: (ph) => {
                if (!localStorage.getItem('consentsToAnalytics')) {
                    // opting out if no consent
                    ph.opt_out_capturing()
                }
            },
            api_host: POSTHOG_DEV_HOST_URL,
            // By default users are opted in (and we show the cookie banner)
            opt_out_capturing_by_default: false,
            // This disables automatic capturing of user events for pricacy concerns:
            // https://posthog.com/docs/integrate/client/js#autocapture
            autocapture: false,
            // capture_pageview doesn't work for SPAs, so disable it (see useTrackPageview hook instead).
            capture_pageview: false,
            // Opt out of session recording for privacy concerns.
            disable_session_recording: true,
            // Used for storage of the User ID and other data needed to track users between sessions.
            // https://posthog.com/docs/integrate/client/js#persistence
            persistence: 'cookie',
            // if this is true, PostHog will automatically determine City, Region and Country data using
            // the IP address of the client
            ip: false,
            // Disable persisting user data across pages. This will disable cookies, session storage and local storage.
            disable_persistence: false,
            // disable_cookie is a fallback to disable_persistence, so disable cookies too.
            // https://github.com/PostHog/posthog-js/blob/96fa9339b9c553a1c69ec5db9d282f31a65a1c25/src/posthog-core.js#L1063-L1065
            disable_cookie: false,
        })
    },
}
