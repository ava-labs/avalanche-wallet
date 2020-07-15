module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    devServer: {
        https: true,
        port: 8080
    },
    // publicPath: '',
    configureWebpack:{
        optimization: {
            splitChunks: {
                chunks: "all",
                minSize: 600 * 1000,
                maxSize: 2000 * 1000,
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
