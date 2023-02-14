export function changeNetwork(cy: Cypress.cy & CyEventEmitter, network = 'Columbus') {
    cy.get('[data-cy="network-selector"]').click() //Network Switcher
    cy.get(`[data-cy="network-name-${network}"]`).click() //Select Columbus Network
}

export function addKopernikusNetwork(cy: Cypress.cy & CyEventEmitter) {
    const localNetworkName = 'Kopernikus'

    cy.get('[data-cy="network-selector"]').click()
    cy.get('[data-cy="add-custom-network"]').click();
    cy.wait(2000);
    cy.get('[data-cy="add-network-field-network-name"]').type(localNetworkName)
    cy.get('[data-cy="add-network-field-protocol"]').clear()
    cy.get('[data-cy="add-network-field-protocol"]').type('https')
    cy.get('[data-cy="add-network-field-host"]').type('kopernikus.camino.network')
    cy.get('[data-cy="add-network-field-port"]').clear();
    cy.get('[data-cy="add-network-field-port"]').type('443')
    cy.get('[data-cy="add-network-field-magellan-address"]').type('https://magellan.kopernikus.camino.network/')
    cy.get('[data-cy="btn-add-network"]').click()
    cy.get(`[data-cy="network-name-${localNetworkName}"]`).click()
}

export async function accessWallet(cy: Cypress.cy & CyEventEmitter, type: string) {
    cy.get('[data-cy="app-selector-menu"]').click()
    cy.get('[data-cy="app-selector-Wallet"]').click()

    if (type === 'mnemonic') {
        cy.get('[data-cy="btn-wallet-access-mnemonic"]').click()
        cy.readFile(`cypress/temp/wallets/mnemonic_wallet.json`).then((data) => {
            let phraseArr = data
            for (let i = 0; i < phraseArr.length; i++) {
                let indexInput = i + 1
                cy.get(`[data-cy="mnemonic-field-${indexInput}"]`).type(phraseArr[i])
            }
            cy.get('[data-cy="btn-submit-mnemonic-phrase"]').click({ force: true })
        })
    }
    if (type === 'privateKey') {
        cy.get('[data-cy="btn-wallet-access-private-key"]').click({ force: true })
        cy.readFile('cypress/temp/wallets/private_key_wallet.json').then((privateKey) => {
            const privateKeyCChain = privateKey.privateKey
            cy.get('[data-cy="field-private-key"]').type(privateKeyCChain)
        })
        cy.get('[data-cy="btn-submit-private-key"]').click()
    }
}