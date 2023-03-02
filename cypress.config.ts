import { defineConfig } from 'cypress'
import cypressGrepPlugin from '@cypress/grep/src/plugin'

import parseEnvPlugin from './cypress/plugins'

export default defineConfig({
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return cypressGrepPlugin(parseEnvPlugin(on, config)) as Cypress.PluginConfigOptions
        },
        baseUrl: 'http://localhost:5001/',
        requestTimeout: 15000,
        //chromeWebSecurity: false,
    },
    env: {
        grepTags: '',
        grepFilterSpecs: true,
    },
})
