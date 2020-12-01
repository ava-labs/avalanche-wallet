import TorusSdk from '@toruslabs/torus-direct-web-sdk'

const torusdirectsdk = new TorusSdk({
    baseUrl: `${location.origin}/serviceworker`,
    enableLogging: false,
})
torusdirectsdk.init()

export { torusdirectsdk }
