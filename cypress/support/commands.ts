// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

import { Interception } from 'cypress/types/net-stubbing'

// -- This is a parent command --
Cypress.Commands.add('addCustomNetwork', (networkConfig: NetworkConfig) => {
    const { networkName, rpcUrl, magellanUrl, explorerUrl } = networkConfig
    cy.get('[data-cy="network-selector"]').click()
    cy.get('[data-cy="add-custom-network"]').click()
    // Wait for re-rendering ??
    cy.wait(2000)
    cy.get('[data-cy="add-network-field-network-name"]', { timeout: 15000 }).find('input', { timeout: 12000 }).type(networkName)
    cy.get('[data-cy="add-network-field-url"]').type(rpcUrl)
    cy.get('[data-cy="add-network-field-magellan-address"]').type(magellanUrl || '')
    cy.get('[data-cy="btn-add-network"]').click()
    // Wait to connecting network
    cy.wait(5000)
    // Click backdrop to close menu
    cy.get(`body > div[role="presentation"].MuiPopover-root`, { timeout: 12000 }).click()
})

Cypress.Commands.add('addCustomNetworkByName', (network: string) => {

    cy.fixture(`${network.toLowerCase()}/network`)
        .then((networkConfig: NetworkConfig) => {
            if (networkConfig) {
                cy.addCustomNetwork(networkConfig)
            }
        })
})

Cypress.Commands.add('changeNetwork', (network: string = 'Kopernikus') => {
    const interceptNetworkInfo = (intercept) => {
        switch (intercept.request.body.method) {
            case 'info.getNetworkID':
                const networkID = intercept.response?.body.result.networkID
                // parsing rpc host
                const urlRegex = /^(https?:)\/\/([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$/ // $1: protocol, $2: host, $3: port, $4: path + query string
                const urlParts = intercept.request.url.match(urlRegex) ?? []
                const host = urlParts[2]
                const port = urlParts[1].startsWith('https') ? 443 : 80
                const protocol = urlParts[1]
                cy.wrap({ protocol, host, port, networkID }).as('currentRpcHost')
                break
            case 'info.getTxFee':
                const txFee = intercept.response?.body.result.txFee
                cy.wrap(txFee).as('txFee')
                break
        }
    }

    // intercept to get default info
    cy.intercept('POST', '**/ext/info', (request) => {
        if (request.body.method === 'info.getNetworkID') {
            request.alias = 'getNetworkID'
        } else if (request.body.method === 'info.getTxFee') {
            request.alias = 'getTxFee'
        }
        else {
            console.log('Other Info Query')
        }
    })

    cy.get('@txtSelectedNetwork')
        .invoke('text')
        .then((currentNetwork) => {
            cy.get('@btnNetworkSwitcher').click({ force: true }) // Network Switcher
            cy.get(`[data-value="${network}"]`).click() // Select Network

            // Waiting 'info.networkID', and 'info.getTxFee'
            cy.wait('@getNetworkID').then(interceptNetworkInfo)
            cy.wait('@getTxFee').then(interceptNetworkInfo)

            // increasing timeout to make sure the network is selected, especially on slowly local dev env
            cy.get('@txtSelectedNetwork', { timeout: 15000 }).should('have.text', network)
            // set context variable
            cy.wrap((network ?? currentNetwork).toLowerCase()).as('currentNetwork')
        })
})

Cypress.Commands.add('accessWallet', (type, keyName) => {
    cy.get('@btnWallet').click({ force: true })
    cy.get('h6 + .MuiGrid-container').as('elWalletOptions')
    cy.get('@elWalletOptions')
        .find('> .MuiGrid-container:nth-child(1) > :nth-child(1)')
        .as('elPrivateKeyOption')
    cy.get('@elWalletOptions')
        .find('> .MuiGrid-container:nth-child(1) > :nth-child(2)')
        .as('elMnemonicOption')
    switch (type) {
        case 'privateKey':
            {
                cy.get('@elPrivateKeyOption').click()
                cy.get('@currentNetwork').then((currentNetwork) => {
                    cy.fixture(`${currentNetwork}/private_key_wallet`).then((privateKeys) => {
                        cy.get('input[type="password"]').type(privateKeys[keyName || 'privateKey'])
                    })
                    cy.get('button[type="button"]').contains('Access Wallet').click()
                })
            }
            break
        case 'mnemonic':
            {
                cy.get('@elMnemonicOption').find('> .MuiButtonBase-root').click()
                cy.get('@currentNetwork').then((currentNetwork) => {
                    cy.fixture(`${currentNetwork}/mnemonic_wallet`).then((phraseArr) => {
                        const mnemonicStr = phraseArr.join(' ')
                        cy.get('input.phrase_word').first()?.type(mnemonicStr)
                        cy.get('button[type="button"]').contains('Access Wallet').click()
                    })
                })
            }
            break
        default:
            break
    }
})

Cypress.Commands.add('switchToWalletApp', () => {
    cy.get('[data-cy="app-selector-menu"]').click()
    cy.get('[data-cy="app-selector-Wallet"]').click()
})

Cypress.Commands.add(
    'loginWalletWith',
    (walletAccessType: WalletAccessType, keyName?: string, network: string = 'Kopernikus') => {
        cy.visit('/')

        // Close cookie dialog
        cy.get('[aria-labelledby="cc-nb-title"] button.cc-nb-okagree').click()

        // header - app(left) menu aliases
        cy.get('[data-cy="app-selector-menu"]').as('elAppMenu')

        // header - preference(right) menu aliases
        cy.get('header > .MuiToolbar-root > .MuiBox-root:nth-child(2)').as('elPreferenceMenu')
        cy.get('@elPreferenceMenu')
            .find('.MuiInputBase-root > .MuiSelect-select', { timeout: 30000 })
            .as('btnNetworkSwitcher')
        cy.get('@btnNetworkSwitcher').find('.MuiTypography-root').as('txtSelectedNetwork')
        cy.get('@elPreferenceMenu').find('> .MuiBox-root').as('btnWallet')

        cy.switchToWalletApp()
        // Only add non-default networks
        if (network === 'Kopernikus') {
            cy.addCustomNetworkByName(network)
        }

        cy.changeNetwork(network)
        cy.accessWallet(walletAccessType, keyName)
    }
)

Cypress.Commands.add('switchToWalletFunctionTab', (func) => {
    let funcKey
    switch (func) {
        case 'Portfolio':
            funcKey = ''
            break
        case 'Send':
            funcKey = 'wallet_transfer'
            break
        case 'Cross Chain':
            funcKey = 'wallet_export'
            break
        case 'Validator':
            funcKey = 'wallet_validator'
            break
        case 'Earn':
            funcKey = 'wallet_earn'
            break
        case 'Studio':
            funcKey = 'wallet_studio'
            break
        case 'Activity':
            funcKey = 'wallet_activity'
            break
        case 'Manage Keys':
            funcKey = 'wallet_manage'
            break
        case 'Advanced':
            funcKey = 'wallet_advanced'
            break
        default:
            throw new Error(`Unsupported wallet function ${func}`)
    }
    if (funcKey === '') {
        cy.get('.top-bar .wallet_link:first-child', { timeout: 15000 }).click()
    } else {
        cy.get(`[data-cy="${funcKey}"]`, { timeout: 15000 }).click()
    }
})

Cypress.Commands.add(
    'waitUntil',
    (alias: string, untilFunc: (intercept: Interception) => boolean) => {
        cy.wait(alias).then((intercept) => {
            const success = untilFunc(intercept)
            if (!success) {
                cy.waitUntil(alias, untilFunc)
            }
        })
    }
)

Cypress.Commands.add(
    'getMockResponseData',
    (
        payloadMethod: string,
        requestUrl: string = '**/ext/bc/C/rpc',
        mockPath?: string,
        aliasName?: string
    ) => {
        if (!mockPath) {
            const transferUnderLinePayloadMethod = payloadMethod
                .replace(/\B([A-Z])/g, '_$1')
                .toLowerCase()
            mockPath = `mocks/${transferUnderLinePayloadMethod}.json`
        }
        if (!aliasName) {
            aliasName = payloadMethod
        }
        cy.fixture(mockPath).then((mockData) => {
            cy.intercept({ method: 'GET', url: requestUrl }, (request) => {
                if (
                    request.body.hasOwnProperty('method') &&
                    request.body.method.includes(payloadMethod)
                ) {
                    request.reply({
                        statusCode: 200,
                        body: mockData,
                    })
                    request.alias = `get_${aliasName}`
                }
            })

            cy.intercept({ method: 'POST', url: requestUrl }, (request) => {
                if (
                    request.body.hasOwnProperty('method') &&
                    request.body.method.includes(payloadMethod)
                ) {
                    request.reply({
                        statusCode: 200,
                        body: mockData,
                    })
                    request.alias = `post_${aliasName}`
                }
            })
        })
    }
)

//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
