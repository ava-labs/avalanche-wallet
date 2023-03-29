import {
    BN,
    bnToAvaxC,
    bnToAvaxX,
    bnToBigAvaxC,
    bnToBigAvaxX,
    GasHelper,
    Big,
} from '@c4tplatform/camino-wallet-sdk/dist'

describe('Cross chain: X to C', () => {
    beforeEach(() => {
        cy.loginWalletWith('privateKey')

        // RPC aliases
        cy.intercept('**/ext/bc/C/rpc', (request) => {
            if (request.body.method === 'eth_baseFee') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/eth_base_fee.json'
                })
                request.alias = 'apiBaseFee'
            }
        })
        cy.intercept('POST', '**/ext/bc/X', (request) => {
            if (request.body.method == 'avm.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avm_getUTXOs.json'
                })
            } else if (request.body.method === 'avm.issueTx') {
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
        cy.intercept('POST', '**/ext/bc/C/avax', (request) => {
            if (request.body.method === 'avax.issueTx') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avax_issue_tx.json'
                })
                request.alias = 'apiImportC'
            } 

            if (request.body.method === 'avax.getAtomicTxStatus') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avax_get_atomic_tx_status.json'
                })
                request.alias = 'apiImportCStatus'
            }

            if (request.body.method === 'avax.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avax_getUTXOs.json'
                })
            }
        })

        // Switch to cross chain
        cy.switchToWalletFunctionTab('Cross Chain')
        // Make sure successfully switched to the Cross Chain tab
        cy.get('.wallet_main > #wallet_router > .header')
            .find('h1')
            .should('have.text', 'Cross Chain')
    })

    it('export CAM from X to C', () => {
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
                if (value !== 'C') {
                    cy.get('@selectDestination').select('C')
                    cy.wait('@apiBaseFee').then((intercept) => {
                        const hexBaseFee = intercept.response?.body.result
                        const bnBaseFee = new BN(hexBaseFee.substring(2), 'hex')
                        cy.wrap(bnBaseFee).as('bnBaseFee')
                    })
                }
            })

        // enter amount to transfer
        cy.get('.swap_form .avax_input input[type="number"]').then(($el) => {
            if($el.val()) {
                cy.wrap($el).click().invoke('val', '').type('0.001')
            }
        })

        // initial balances
        cy.get('.chain_card .balance')
            .first()
            .invoke('text')
            .then((balance) => cy.wrap(balance).as('initialXBalance'))
        cy.get('.chain_card .balance')
            .last()
            .invoke('text')
            .then((balance) => cy.wrap(balance).as('initialCBalance'))

        // the default tx fee of X/P chain is intercepting from rpc on network changed
        // from source chain
        cy.get<string>('@txFee').then((txFee) => {
            // check export fee
            console.debug('txFee: ', bnToAvaxX(new BN(txFee)))
            cy.get('div')
                .contains('Export Fee')
                .find('span')
                .should('have.text', `${bnToAvaxX(new BN(txFee))} CAM`)

            // check import fee
            // use (camino-wallet-sdk).GasHelper to estimate the tx fee of importing to C chain
            const importTxFee = GasHelper.estimateImportGasFeeFromMockTx(1, 1)
            console.debug('import tx fee: ', importTxFee)
            cy.get<BN>('@bnBaseFee').then((baseFee) => {
                console.debug('C base fee(BN): ', baseFee.toString())
                // `getBaseFeeRecommended` function will increase the base fee with 25% up
                const feeWei = baseFee
                    .add(baseFee.mul(new BN(25)).div(new BN(100)))
                    .mul(new BN(importTxFee))
                console.debug('C import fee: ', bnToAvaxC(feeWei))
                cy.get('div')
                    .contains('Import Fee')
                    .find('span')
                    .should('have.text', `${bnToAvaxC(feeWei)} CAM`)
                cy.wrap(bnToBigAvaxC(feeWei)).as('importFee')
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
            cy.wait('@apiImportC').then((intercept) => {
                const txID = intercept.response?.body.result.txID
                cy.get('.tx_state_card')
                    .last()
                    .find('.data_row > p')
                    .first()
                    .should('have.text', txID)
            })
            // wait `avax.getAtomicTxStatus` to get the tx status
            cy.waitUntil('@apiImportCStatus', (intercept) => {
                const txStatus = intercept.response?.body.result.status
                if (txStatus === 'Accepted') {
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
