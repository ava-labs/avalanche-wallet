const merge = require('webpack-merge')
const common = require('./webpack.common.js')

let timestamp = Date.now()
const publicPath = process.env.PUBLIC_PATH
const dist = process.env.DIST

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',

    output: {
        publicPath: publicPath,
        filename: 'js/[name].[fullhash:8].' + timestamp + '.js',
        chunkFilename: 'js/[name].[fullhash:8].' + timestamp + '.js',
        path: __dirname + dist,
        clean: true,
    },

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
})
