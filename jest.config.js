const { defaults } = require('jest-config')
const crypto = require('crypto')

module.exports = {
    globals: {
        ...defaults.globals,
        crypto: {
            getRandomValues: (arr) => crypto.randomBytes(arr.length),
        },
    },
    moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
    transform: {
        '.*\\.(vue)$': 'vue-jest',
        '^.+\\.ts?$': 'ts-jest',
        '^.+\\.js?$': 'babel-jest',
    },
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/src/$1',
    },
    testURL: 'https://localhost/',
    testEnvironment: 'jsdom',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
}
