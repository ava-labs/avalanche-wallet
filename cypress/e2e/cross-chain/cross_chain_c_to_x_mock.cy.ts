import {
    BN,
    bnToAvaxX,
    bnToBigAvaxC,
    bnToBigAvaxX,
    GasHelper,
    Big,
    numberToBNAvaxC,
} from '@c4tplatform/camino-wallet-sdk/dist'

describe('Cross chain: C to X', () => {
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
            } else if (request.body.method === 'eth_getBalance') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: '0x1b0cf699489af08800',
                    },
                })
            }
        })

        cy.intercept('POST', '**/ext/bc/X', (request) => {
            if (request.body.method === 'avm.issueTx') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avm_issue_tx.json'
                })
                request.alias = 'apiImportX'
            }
            
            if (request.body.method === 'avm.getTxStatus') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avm_get_tx_status.json'
                })
                request.alias = 'apiImportXStatus'
            }

            if (request.body.method === 'avm.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avm_getUTXOs.json'
                })
            }
            
        })
        cy.intercept('POST', '**/ext/bc/C/avax', (request) => {
            if (request.body.method === 'avax.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avax_getUTXOs.json'
                })
            } else if (request.body.method === 'avax.issueTx') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avax_issue_tx.json'
                })
                request.alias = 'apiExportC'
            } else if (request.body.method === 'avax.getAtomicTxStatus') {
                request.reply({
                    statusCode: 200,
                    fixture: 'mocks/avax_get_atomic_tx_status.json'
                })
                request.alias = 'apiExportCStatus'
            }
        })
        // Switch to cross chain
        cy.switchToWalletFunctionTab('Cross Chain')
        // Make sure successfully switched to the Cross Chain tab
        cy.get('.wallet_main > #wallet_router > .header')
            .find('h1')
            .should('have.text', 'Cross Chain')
    })

    it('export CAM from C to X', () => {
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
                if (value !== 'C') {
                    cy.get('@selectSource').select('C')
                    cy.wait('@apiBaseFee').then((intercept) => {
                        const hexBaseFee = intercept.response?.body.result
                        const bnBaseFee = new BN(hexBaseFee.substring(2), 'hex')
                        cy.wrap(bnBaseFee).as('bnBaseFee')
                    })
                }
            })
        cy.get('@selectDestination')
            .invoke('val')
            .then((value) => {
                if (value !== 'X') {
                    cy.get('@selectDestination').select('X')
                }
            })
        cy.get('.max_but').click()
        // initial balances
        // WARNING: .invoke('text').as() will return reference, not only value, so we need to get the value under 'then' and then wrapping it into alias
        cy.get('.chain_card .balance')
            .first()
            .invoke('text')
            .then((balance) => cy.wrap(balance).as('initialCBalance'))
        cy.get('.chain_card .balance')
            .last()
            .invoke('text')
            .then((balance) => cy.wrap(balance).as('initialXBalance'))

        // check export fee
        // get from - C chain address
        cy.get('.bottom_tabs .chain_select button').last().click()
        // WARNING: .invoke('text').as() will return reference, not only value, so we need to get the value under 'then' and then wrapping it into alias
        cy.get('[data-cy="wallet_address"')
            .invoke('text')
            .then((address) => cy.wrap(address.trim()).as('fromAddress'))
        // get to - P address(hard-coded)
        // !! Don't know why it is hard-coded in source to get P-chain address regardless of the chain selected
        cy.get('.bottom_tabs .chain_select button:nth-child(2)').click()
        cy.get('[data-cy="wallet_address"').invoke('text').as('toAddress')

        // use (camino-wallet-sdk).GasHelper to estimate the tx fee of exporting from C chain
        cy.get<string>('@toAddress')
            .then((toAddress) =>
                cy.get<string>('@fromAddress').then((fromAddress) => ({
                    fromAddress,
                    toAddress,
                }))
            )
            .then(({ fromAddress, toAddress }) => {
                const exportTxFee = GasHelper.estimateExportGasFeeFromMockTx(
                    'X',
                    numberToBNAvaxC('0.001'),
                    fromAddress,
                    toAddress
                )
                cy.get<BN>('@bnBaseFee')
                    .then((baseFee) => {
                        console.debug('C base fee(BN): ', baseFee.toString())
                        // `getBaseFeeRecommended` function will increase the base fee with 25% up
                        const feeWei = baseFee
                            .add(baseFee.mul(new BN(25)).div(new BN(100)))
                            .mul(new BN(exportTxFee))
                        return feeWei
                    })
                    .then((feeWei) => {
                        cy.wrap(bnToBigAvaxC(feeWei)).as('exportFee')
                        cy.get('div')
                            .contains('Export Fee')
                            .find('span')
                            .should('contains.text', bnToBigAvaxC(feeWei).toString())
                    })
            })

        // the default tx fee of X/P chain is intercepting from rpc on network changed
        // from destination chain X
        cy.get<string>('@txFee')
            .then((txFee) => {
                // check import fee
                console.debug('txFee: ', bnToAvaxX(new BN(txFee)))
                cy.get('div')
                    .contains('Import Fee')
                    .find('span')
                    .should('contains.text', `${bnToAvaxX(new BN(txFee))}`)

                // send tx
                // click CONFIRM button
                cy.get('div.fees:has(> h4) + div button').click()
                // click TRANSFER button
                cy.get('[data-cy="submit"]').click()
                // listening rpcs
                // wait `avax.issueTx` to get txID
                cy.wait('@apiExportC').then((intercept) => {
                    const txID = intercept.response?.body.result.txID
                    cy.get('.tx_state_card')
                        .first()
                        .get('.data_row > p')
                        .first()
                        .should('have.text', txID)
                })
                // wait `avax.getAtomicTxStatus` to get the tx status
                cy.waitUntil('@apiExportCStatus', (intercept) => {
                    const txStatus = intercept.response?.body.result.status
                    console.debug(`txStatus: ${txStatus}`)
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
                // wait `avm.issueTx` to get txID
                cy.wait('@apiImportX').then((intercept) => {
                    const txID = intercept.response?.body.result.txID
                    cy.get('.tx_state_card')
                        .last()
                        .find('.data_row > p')
                        .first()
                        .should('have.text', txID)
                })
                // wait `avm.getTxStatus` to get the tx status
                // looks like client polling to get tx status until 'Accepted'
                cy.waitUntil('@apiImportXStatus', (intercept) => {
                    const txStatus = intercept.response?.body.result.status
                    console.debug(`txStatus: ${txStatus}`)
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
            })
    })
})
