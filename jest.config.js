module.exports = {
    moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
    transform: {
        '.*\\.(vue)$': 'vue-jest',
        '^.+\\.ts?$': 'ts-jest',
        '^.+\\.js?$': 'babel-jest',
    },
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['./jest.setup.js'],
    testURL: 'https://localhost/',
    testEnvironment: 'jsdom',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
}
