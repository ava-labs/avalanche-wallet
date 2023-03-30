module.exports = {
    modulePathIgnorePatterns: ['camino-wallet-sdk'],
    moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
    transform: {
        '.*\\.(vue)$': '@vue/vue2-jest',
        '^.+\\.ts?$': 'ts-jest',
        '^.+\\.js?$': 'babel-jest',
    },
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['./jest.setup.js'],
    testEnvironmentOptions: {
        url: 'https://localhost/',
    },
    testEnvironment: '<rootDir>/jest.environment.jsdom.js',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
}
