const HtmlWebPackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const { VueLoaderPlugin } = require('vue-loader')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const path = require('path')
const deps = require('./package.json').dependencies
module.exports = {
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                include: /src/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff)$/,
                type: 'asset/resource',
            },
            {
                test: /\.(scss|css|sass)$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    cache: false,
    resolve: {
        extensions: ['.tsx', '.ts', '.vue', '.jsx', '.js', '.json'],
        alias: {
            vue: 'vue/dist/vue.min.js',
            '@': path.resolve(__dirname, 'src'),
        },
    },

    plugins: [
        new VueLoaderPlugin(),
        new VuetifyLoaderPlugin(),
        new NodePolyfillPlugin(),
        new ModuleFederationPlugin({
            name: 'wallet',
            filename: 'remoteEntry.js',
            remotes: {},
            exposes: {
                './store': './src/store/index.ts',
                './mountApp': './src/bootloader.ts',
                './AvaNetwork': './src/js/AvaNetwork.ts',
                './moutHomePage': './src/mountHomePage.ts',
                './mountCreate': './src/views/createMount.ts',
                './mountAccessComponents': './src/views/access/mountAccessComponents.ts',
                './mountLegal': './src/views/mountLegal.ts',
                './mountAccountMenu': './src/components/wallet/sidebar/mountAccountMenu.ts',
                './mountAccounts': './src/components/Access/mountAccounts.ts',
                './mountKyesComponent': './src/components/wallet/manage/mountKyesComponent.ts',
                './mountsaveKyesButton': './src/views/wallet/mountSaveKeysButton.ts',
            },
        }),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            favicon: './public/favicon.ico',
        }),
    ],
}
