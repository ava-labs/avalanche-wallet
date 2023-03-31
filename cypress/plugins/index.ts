/**
 * Rather then have a bunch of configs for each environment we simply
 * create a object here, dynamically change it based on various environment variables
 * and pass it to cypress just before it starts.
 */

const CYPRESS_CONFIG_PROD = {
    baseUrl: 'https://wallet.camino.network/',
}

const CYPRESS_CONFIG_COLUMBUS = {
    baseUrl: 'https://dev.suite.camino.network/',
}

const CYPRESS_CONFIG_LOCAL = {
    baseUrl: `http://localhost:5001/`,
}

const mergeConfig = (config, override) => ({
    ...config,
    ...override,
})
/**
 * @type {Cypress.PluginConfig}
 */
export default (on, config) => {
    const testEnv = process.env.TEST_ENV?.toLowerCase()
    console.log(`Will testing on ${testEnv} ...`)

    let cypressConfig = mergeConfig(config, CYPRESS_CONFIG_LOCAL)
    switch (testEnv) {
        case 'columbus':
            console.info('Testing on Columbus')
            cypressConfig = mergeConfig(config, CYPRESS_CONFIG_COLUMBUS)
            break
        case 'prod':
        case 'production':
            cypressConfig = mergeConfig(config, CYPRESS_CONFIG_PROD)
            break
        case 'local':
        case 'dev':
        default:
            break
    }
    return cypressConfig
}
