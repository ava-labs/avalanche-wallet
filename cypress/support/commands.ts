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
Cypress.Commands.add('changeNetwork', (network: string = 'Columbus') => {
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
    cy.get('@txtSelectedNetwork')
        .invoke('text')
        .then((currentNetwork) => {
            if (currentNetwork !== network) {
                cy.get('@btnNetworkSwitcher').click() // Network Switcher
                cy.get(`[data-value="${network}"]`).click() // Select Columbus Network

                // intercept to find current rpc url
                cy.intercept('POST', '**/ext/info').as('apiNetworkInfo')
                // intercept to get default asset symbol
                cy.intercept('POST', '**/ext/bc/X', (request) => {
                    if (request.body.method === 'avm.getAssetDescription') {
                        request.alias = 'assetDesc'
                    }
                })

                // Waiting 'info.networkID', and 'info.getTxFee'
                cy.wait('@apiNetworkInfo').then(interceptNetworkInfo)
                cy.wait('@apiNetworkInfo').then(interceptNetworkInfo)
                // Waiting 'avm.getAssetDescription'
                cy.wait('@assetDesc')
                    .then((intercept) => intercept.response?.body.result.symbol)
                    .as('assetSymbol')

                // increasing timeout to make sure the network is selected, especially on slowly local dev env
                cy.get('@txtSelectedNetwork', { timeout: 15000 }).should('have.text', network)
            }
            // set context variable
            cy.wrap((network ?? currentNetwork).toLowerCase()).as('currentNetwork')
        })
})
Cypress.Commands.add('accessWallet', (type, keyName) => {
    cy.get('@btnWallet').click()
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

    cy.intercept('GET', '**/api/v1/verified/*').as('apiVerifiedAddress')
    cy.wait('@apiVerifiedAddress').then((intercept) => {
        console.log('verified address: ', intercept.request.url)
        const pathRegex = /^https?:\/\/[A-Za-z0-9\-\.]+\/api\/v1\/verified\/(.*)$/
        const matchGroup = intercept.request.url.match(pathRegex)
        cy.get('@elPreferenceMenu')
            .find(':nth-child(3) > [role="button"]', { timeout: 15000 })
            .should('have.text', matchGroup?.[1])
    })
})
Cypress.Commands.add('switchToWalletApp', () => {
    cy.get('@elAppMenu').click()
    cy.get('.MuiPopover-paper > .MuiMenu-list').as('elAppOptions')
    // App option items
    cy.get('@elAppOptions').find('[data-value="Wallet"]').as('elAppOptionWallet')
    cy.get('@elAppOptions').find('[data-value="Explorer"]').as('elAppOptionExplorer')

    cy.get('@elAppOptionWallet').click()
})
Cypress.Commands.add(
    'loginWalletWith',
    (walletAccessType: WalletAccessType, keyName?: string, network: string = 'Columbus') => {
        cy.visit('/')

        // header - app(left) menu aliases
        cy.get('header > .MuiToolbar-root > .MuiBox-root:nth-child(1)').as('elAppMenu')

        // header - preference(right) menu aliases
        cy.get('header > .MuiToolbar-root > .MuiBox-root:nth-child(2)').as('elPreferenceMenu')
        cy.get('@elPreferenceMenu')
            .find('.MuiInputBase-root > .MuiSelect-select', { timeout: 30000 })
            .as('btnNetworkSwitcher')
        cy.get('@btnNetworkSwitcher').find('.MuiTypography-root').as('txtSelectedNetwork')
        cy.get('@elPreferenceMenu').find('> .MuiBox-root').as('btnWallet')

        cy.switchToWalletApp().changeNetwork(network).accessWallet(walletAccessType, keyName)
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
