module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript',
        'plugin:prettier-vue/recommended',
        'prettier/vue',
    ],
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    rules: {
        'no-console': 'off',
        'vue/no-unused-components': 'off',
        'vue/multiline-html-element-content-newline': 'off',
        'no-unreachable': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
}
