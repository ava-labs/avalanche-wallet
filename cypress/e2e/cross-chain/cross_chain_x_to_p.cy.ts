import {
    BN,
    bnToAvaxX,
    bnToBigAvaxX,
    bnToBigAvaxP,
    Big,
} from '@c4tplatform/camino-wallet-sdk'

describe('Cross chain: X to P', { tags: ['@cross-chain'] }, () => {
    context('normal cases: ', () => {
        beforeEach(() => {
            cy.loginWalletWith('privateKey', 'privateKeyCrossChain')
            // Switch to cross chain
            cy.switchToWalletFunctionTab('Cross Chain')
            // Make sure successfully switched to the Cross Chain tab
            cy.get('.wallet_main .head > h1', { timeout: 15000 }).should('have.text', 'Cross Chain')

            // RPC aliases
            cy.intercept('POST', '**/ext/bc/X', (request) => {
                if (request.body.method === 'avm.issueTx') {
                    request.alias = 'apiExportX'
                } else if (request.body.method === 'avm.getTxStatus') {
                    request.alias = 'apiExportXStatus'
                }
            })
            cy.intercept('POST', '**/ext/bc/P', (request) => {
                if (request.body.method === 'platform.issueTx') {
                    request.alias = 'apiImportP'
                } else if (request.body.method === 'platform.getTxStatus') {
                    request.alias = 'apiImportPStatus'
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
            // Switch source and destination chains
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
            cy.get('.swap_form .avax_input input[type="number"]').type('0.001')

            // initial balances
            cy.get('.chain_card .balance')
                .first()
                .invoke('text')
                .then((balance) => cy.wrap(balance).as('initialXBalance'))
            cy.get('.chain_card .balance')
                .last()
                .invoke('text')
                .then((balance) => cy.wrap(balance).as('initialPBalance'))

            cy.get<string>('@txFee').then((txFee) => {
                console.debug('txFee: ', bnToAvaxX(new BN(txFee)))
                cy.get('div')
                    .contains('Export Fee')
                    .find('span')
                    .should('have.text', `${bnToAvaxX(new BN(txFee))} CAM`)

                const bnTxFee = new BN(txFee)
                console.debug('txFee: ', bnToAvaxX(new BN(txFee)))
                cy.get('div')
                    .contains('Import Fee')
                    .find('span')
                    .should('have.text', `${bnToAvaxX(txFee)} CAM`)

                cy.get('div')
                    .contains('Total')
                    .find('span')
                    .invoke('text')
                    .then((totalFee) => {
                        const XToPTotalFee = bnToBigAvaxX(bnTxFee.add(new BN(txFee)))
                        expect(totalFee).to.equal(`${XToPTotalFee.toString()} CAM`)
                    })

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
                cy.wait('@apiImportP').then((intercept) => {
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
                    console.log('txStatus: ', txStatus)
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

                cy.get<string>('@initialXBalance')
                    .then((initialBalance) => {
                        console.debug('initial X balance: ', initialBalance)
                        cy.get<string>('@amount').then((amount) => {
                            // initial X balance - amount
                            return new Big(initialBalance).minus(amount)
                        })
                    })
                    .then((bigBalance) => {
                        cy.get<string>('@txFee').then((exportFee) =>
                            new Big(bigBalance).minus(bnToBigAvaxX(new BN(exportFee)))
                        )
                    })
                    .then((bigBalance) => {
                        cy.get<string>('@txFee').then((importFee) =>
                            new Big(bigBalance).minus(bnToBigAvaxP(new BN(importFee)))
                        )
                    })
                    .then((expectedBalance) => {
                        cy.get('.chain_card .balance')
                            .first()
                            .should('have.text', expectedBalance.toString())
                    })

                // check the balances on P chain
                cy.get<string>('@initialPBalance')
                    .then((initialBalance) => {
                        console.debug('initial P balance: ', initialBalance)
                        cy.get<string>('@amount').then((amount) => {
                            // initial P balance + amount
                            return new Big(initialBalance).plus(amount)
                        })
                    })
                    .then((expectedBalance) => {
                        cy.get('.chain_card .balance')
                            .last()
                            .should('have.text', expectedBalance.toString())
                    })
            })
        })
    })
})
