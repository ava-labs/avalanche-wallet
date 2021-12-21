import { expect } from 'chai'

const NETWORK_SWITCHER_BUTTON = '[data-cy="network-switcher"]'

describe('Basic Functionality', () => {
    before(() => {
        cy.visit('/')
        // Disable banner
        cy.get('[data-cy="dismiss_banner"]').click()
    })

    it('has access/create wallet options', () => {
        cy.get('[data-cy=create]').should('have.length', 2)
        cy.get('[data-cy=access]').should('have.length', 2)
    })

    describe('Network Switcher', () => {
        beforeEach(() => {
            cy.get(NETWORK_SWITCHER_BUTTON).click()
        })

        afterEach(() => {
            cy.get(NETWORK_SWITCHER_BUTTON).click()
        })

        it('can add custom network option', () => {
            cy.get('[data-cy="custom-network-option"]').should('have.length', 1)
            cy.get('[data-cy="create-custom-option"]', { timeout: 10000 })
                .should('have.length', 1)
                .click()

            cy.fixture('custom_networks/basic_network.json').then((info) => {
                cy.get('[data-cy="custom-network-name"]').clear().type(info.name)
                cy.get('[data-cy="custom-network-url"]').clear().type(info.url)
                cy.get('[data-cy="custom-network-add"]').click()
                cy.get('[data-cy="network-item"]').should('have.length', 3)
            })
        })
    })
})
