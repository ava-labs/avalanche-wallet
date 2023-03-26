import {
    BN,
    bnToAvaxX
} from '@c4tplatform/camino-wallet-sdk'

describe('Cross chain: X to P', () => {
    context('normal cases: ', () => {
        beforeEach(() => {
            cy.loginWalletWith('privateKey')
            // Switch to cross chain
            cy.switchToWalletFunctionTab('Cross Chain')
            // Make sure successfully switched to the Cross Chain tab
            cy.get('.wallet_main > #wallet_router > .header')
                .find('h1')
                .should('have.text', 'Cross Chain')

            // RPC aliases
            cy.intercept('POST', '**/ext/bc/X', (request) => {
                if (request.body.method === 'avm.issueTx') {
                    request.reply({
                        statusCode: 200,
                        fixture: 'mocks/avm_issue_tx.json'
                    })
                    request.alias = 'apiExportX'
                } else if (request.body.method === 'avm.getTxStatus') {
                    request.reply({
                        statusCode: 200,
                        fixture: 'mocks/avm_get_tx_status.json'
                    })
                    request.alias = 'apiExportXStatus'
                }
            })
            cy.intercept('POST', '**/ext/bc/P', (request) => {
                if (request.body.method === 'platform.issueTx') {
                    request.reply({
                        statusCode: 200,
                        fixture: 'mocks/platform_issue_tx.json'
                    })
                    request.alias = 'apiImportP'
                }  
                
                if (request.body.method === 'platform.getTxStatus') {
                    request.reply({
                        statusCode: 200,
                        fixture: 'mocks/platform_get_tx_status.json'
                    })
                    request.alias = 'apiImportPStatus'
                }

                if (request.body.method === 'platform.getUTXOs') {
                    request.reply({
                        statusCode: 200,
                        fixture: 'mocks/platform_getUTXOs.json'
                    })
                }
            })
        })

        it('export CAM from X to P', () => {
            cy.get('label').contains('Source Chain').siblings('select').first().as('selectSource')
            cy.get('label')
                .contains('Destination Chain')
                .siblings('select')
                .first()
                .as('selectDestination')
            //Switch source and destination chains
            cy.get('@selectSource')
                .invoke('val')
                .then((value) => {
                    if (value !== 'X') {
                        cy.get('@selectSource').select('X')
                    }
                })
            cy.get('@selectDestination')
                .invoke('val')
                .then((value) => {
                    if (value !== 'P') {
                        cy.get('@selectDestination').select('P')
                    }
                })

            // enter amount to transfer
            cy.get('.swap_form .avax_input input[type="number"]').invoke('val', '').type('0.001')

            // initial balances
            cy.get('.chain_card .balance')
                .first()
                .invoke('text')
                .then((balance) => cy.wrap(balance).as('initialXBalance'))
            cy.get('.chain_card .balance')
                .eq(1)
                .invoke('text')
                .then((balance) => cy.wrap(balance).as('initialPBalance'))

            cy.get<string>('@txFee').then((txFee) => {
                console.debug('txFee: ', bnToAvaxX(new BN(txFee)))
                cy.get('div')
                    .contains('Export Fee')
                    .find('span')
                    .should('have.text', `${bnToAvaxX(new BN(txFee))} CAM`)

                console.debug('txFee: ', bnToAvaxX(new BN(txFee)))
                cy.get('div')
                    .contains('Import Fee')
                    .find('span')
                    .should('have.text', `${bnToAvaxX(txFee)} CAM`)

                // send tx
                // click CONFIRM button
                cy.get('div.fees:has(> h4) + div button').click()
                // click TRANSFER button
                cy.get('[data-cy="submit"]').click()

                // wait `avm.issueTx` to get txID
                cy.wait('@apiExportX').then((intercept) => {
                    const txID = intercept.response?.body.result.txID
                    cy.get('.tx_state_card')
                        .first()
                        .find('.data_row > p')
                        .first()
                        .should('have.text', txID)
                })

                // wait `avm.getTxStatus` to get the tx status
                // looks like client polling to get tx status until 'Accepted'
                cy.waitUntil('@apiExportXStatus', (intercept) => {
                    const txStatus = intercept.response?.body.result.status
                    if (txStatus === 'Accepted') {
                        cy.get('.tx_state_card')
                            .first()
                            .find('.data_row > p')
                            .last()
                            .should('have.text', txStatus)
                        return true
                    }
                    return false
                })

                // wait `avax.issueTx` to get txID
                cy.wait('@apiImportP', { timeout: 30000 }).then((intercept) => {
                    const txID = intercept.response?.body.result.txID
                    cy.get('.tx_state_card')
                        .last()
                        .find('.data_row > p')
                        .first()
                        .should('have.text', txID)
                })

                // wait `avax.getAtomicTxStatus` to get the tx status
                cy.waitUntil('@apiImportPStatus', (intercept) => {
                    const txStatus = intercept.response?.body.result.status
                    if (txStatus === 'Committed') {
                        cy.get('.tx_state_card')
                            .last()
                            .find('.data_row > p')
                            .last()
                            .should('have.text', txStatus)
                        return true
                    }
                    return false
                })

                // check 'Transfer Completed' message
                cy.get('.complete > h4').should('have.text', 'Transfer Completed')

                // check the balances on X chain
                cy.get('.confirmation_val > p')
                    .invoke('text')
                    .then((amountWithSymbol) => amountWithSymbol.replace(/(\s)?CAM/, ''))
                    .as('amount')

            })
        })
    })
})
