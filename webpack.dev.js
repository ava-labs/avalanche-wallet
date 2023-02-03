const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',

    devServer: {
        port: 3003,
        historyApiFallback: true,
        static: './dist',
    },
})
