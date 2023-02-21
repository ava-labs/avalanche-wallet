export function changeNetwork(cy: Cypress.cy & CyEventEmitter, network = 'Columbus') {
    acceptCookies();
    cy.get('[data-cy="network-selector"]').click() //Network Switcher
    cy.get(`[data-cy="network-name-${network}"]`).click() //Select Columbus Network
}

export function acceptCookies() {
    cy.get('.cc-nb-okagree').click()
}

export function addKopernikusNetwork(cy: Cypress.cy & CyEventEmitter) {
    acceptCookies();
    // let configNetwork = {
    //     networkName: 'Localhost',
    //     urlAndPort: 'http://localhost:9650',
    //     magellandUrl: 'http://localhost:8080',
    //     sigavaultAddress: '',
    // }

    let configNetwork = {
        networkName: 'Kopernikus',
        urlAndPort: 'https://kopernikus.camino.network:443',
        magellandUrl: 'https://magellan.kopernikus.camino.network',
        sigavaultAddress: ''
    }

    cy.get('[data-cy="network-selector"]', { timeout: 12000 }).click()
    cy.get('[data-cy="add-custom-network"]', { timeout: 12000 }).click()
    cy.wait(10000)
    cy.get('[data-cy="add-network-field-network-name"]', { timeout: 12000 })
        .find('input', { timeout: 12000 })
        .type(`${configNetwork.networkName}`)
    cy.get('[data-cy="add-network-field-url"]', { timeout: 12000 })
        .find('input', { timeout: 12000 })
        .type(configNetwork.urlAndPort, { force: true })
    cy.get('[data-cy="add-network-field-magellan-address"]', { timeout: 12000 })
        .find('input', { timeout: 12000 })
        .type(configNetwork.magellandUrl, { force: true })
    cy.get('[data-cy="btn-add-network"]', { timeout: 12000 }).click()
    cy.get(`[data-cy="network-name-${configNetwork.networkName}"]`, { timeout: 12000 }).click()
    cy.wait(2000)
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
        cy.get('[data-cy="btn-wallet-access-private-key"]',{timeout: 10000}).click();
        cy.readFile('cypress/temp/wallets/private_key_wallet.json').then((privateKey) => {
            const privateKeyCChain = privateKey.privateKey
            cy.get('[data-cy="field-private-key"]',{timeout: 10000}).type(privateKeyCChain)
        })
        cy.get('[data-cy="btn-submit-private-key"]').click();
    }
}
