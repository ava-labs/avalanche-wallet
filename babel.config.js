module.exports = {
    presets: ['@vue/cli-plugin-babel/preset'],
    plugins: [
        ['@babel/proposal-decorators', { legacy: true }],
        ['@babel/proposal-class-properties', { loose: true }],
    ],
    env: {
        test: {
            presets: [['@babel/preset-env', { targets: '> 0.25%, not dead' }]],
            plugins: ['@babel/plugin-transform-modules-commonjs'],
        },
    },
}
