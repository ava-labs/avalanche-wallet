module.exports = {
    presets: [['@babel/preset-env', { useBuiltIns: 'entry', corejs: 3 }]],
    plugins: [['@babel/proposal-decorators', { legacy: true }]],
}
