import { defineConfig } from 'cypress'
import cypressGrepPlugin from '@cypress/grep/src/plugin'
import parseEnvPlugin from './cypress/plugins'
import webpack from 'webpack'
const webpackPreprocessor = require('@cypress/webpack-preprocessor')

export default defineConfig({
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            const options = {
                webpackOptions: {
                    resolve: {
                        extensions: ['.ts', '.js', '.vue'],
                        alias: {
                            crypto: require.resolve('crypto-browserify'),
                            stream: require.resolve('stream-browserify'),
                        },
                    },
                    mode: 'development',
                    module: {
                        rules: [
                            {
                                test: /\.ts$/,
                                exclude: /node_modules/,

                                loader: 'ts-loader',
                                options: {
                                    transpileOnly: true,
                                },
                            },
                        ],
                    },
                    plugins: [
                        new webpack.ProvidePlugin({
                            process: 'process/browser.js',
                            Buffer: ['buffer', 'Buffer'],
                        }),
                    ],
                },
            }

            on('file:preprocessor', webpackPreprocessor(options))
            return cypressGrepPlugin(parseEnvPlugin(on, config)) as Cypress.PluginConfigOptions
        },
        baseUrl: 'http://localhost:5001/',
        requestTimeout: 15000,
        // chromeWebSecurity: false,
    },
    env: {
        grepTags: '',
        grepFilterSpecs: true,
        grepOmitFiltered: true,
        grepUntagged: true
    },
})
