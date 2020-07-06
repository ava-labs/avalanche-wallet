module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    devServer: {
        https: false,
        port: 8080
    },
    // publicPath: '',
    configureWebpack:{
        optimization: {
            splitChunks: {
                minSize: 10000,
                maxSize: 200000,
            }
        }
    },
    pwa: {
        name: "AVAX Wallet",
        manifestOptions: {
            start_url: '/'
        },
        iconPaths: {
            favicon16: 'img/icons/favicon-16x16.png',
            favicon32: 'img/icons/favicon-32x32.png',
            appleTouchIcon: 'img/icons/apple-touch-icon.png',
            maskIcon: 'img/icons/favicon-32x32.png',
            msTileImage: 'img/icons/mstile-150x150.png'
        }
    }
};
