import { defineConfig } from 'cypress'

import parseEnvPlugin from './cypress/plugins'

export default defineConfig({
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return parseEnvPlugin(on, config)
        },
        baseUrl: 'https://localhost:5000/',
        requestTimeout: 15000,
    }
})
