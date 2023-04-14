const merge = require('webpack-merge')
const common = require('./webpack.common.js')

const publicPath = process.env.PUBLIC_PATH

module.exports = merge(common, {
    mode: 'production',

    output: {
        publicPath: publicPath,
        filename: 'js/[name].[fullhash:8].js',
        chunkFilename: 'js/[name].[fullhash:8].js',
    },

    performance: {
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
})
