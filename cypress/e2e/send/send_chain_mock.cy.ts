import { BN, bnToAvaxC } from '@c4tplatform/camino-wallet-sdk'

describe('Send: C to C transfer by already owned balance', () => {
    beforeEach(() => {
        cy.loginWalletWith('privateKey')

        cy.get('[data-cy="wallet_transfer"]', { timeout: 15000 })
            .click()
            .should('have.class', 'router-link-active')

        // Hidden Show Breakdown
        cy.get('.breakdown_toggle').first().click()

        // Get Own C-Chain Balance
        cy.get('.alt_breakdown > :nth-child(1) > :nth-child(6)')
            .invoke('text')
            .then((balance) => {
                cy.wrap(balance.replace(/\sCAM/g, '')).as('ownChainBalance')
            })

        // Switch Source Chain to C
        cy.get('.lists > div:nth-child(1) > .chain_select > button:nth-child(2)').click()

        // Input More than Own Amount
        cy.get('.evm_input_dropdown > .col_in > .col_big_in > input').as('inputAmount')
        cy.get<string>('@ownChainBalance').then((balance) => {
            const increaseBalance = parseFloat(balance) + 1
            cy.get('@inputAmount')
                .type(`${increaseBalance}{enter}`)
                .then((input) => {
                    const amount = parseFloat(input.val() as string)
                    expect(amount).to.lte(parseFloat(balance))
                })
        })
    })

    it('as an error message is shown for inputting x-chain wallet address', () => {
        cy.get<string>('@ownChainBalance').then((balance) => {
            if (balance > 0) {
                // Input X Chain Addr
                cy.get('.bottom_tabs > .chain_select > button:nth-child(1)').click()
                cy.get('[data-cy="wallet_address"]').invoke('text').as('chainAddress')
                cy.get<string>('@chainAddress').then((chainAddr) => {
                    cy.get('input[class="pk_in"]').eq(0).type(chainAddr)
                })
    
                // Click Confirm Btn
                cy.get('.button_primary').eq(0).click()
    
                cy.get('.err')
                    .invoke('text')
                    .should(
                        'eq',
                        'Invalid C Chain address. Make sure your address begins with "0x" or "C-0x"'
                    )
            }
        })
    })

    it('as an error message is shown for inputting p-chain wallet address', () => {

        cy.get<string>('@ownChainBalance').then((balance) => {
            if (balance > 0) {
                // Input P Chain Addr
                cy.get('.bottom_tabs > .chain_select > button:nth-child(2)').click()
                cy.get('[data-cy="wallet_address"]').invoke('text').as('chainAddress')
                cy.get<string>('@chainAddress').then((chainAddr) => {
                    cy.get('input[class="pk_in"]').eq(0).type(chainAddr)
                })

                // Click Confirm Btn
                cy.get('.button_primary').eq(0).click()

                cy.get('.err')
                    .invoke('text')
                    .should(
                        'eq',
                        'Invalid C Chain address. Make sure your address begins with "0x" or "C-0x"'
                    )
            }
        })
    })

    it('verify Fee from C to C', () => {
        cy.get<string>('@ownChainBalance').then((balance) => {
            if (balance > 0) {
                // Input C Chain Addr
                cy.get('.bottom_tabs > .chain_select > button:nth-child(3)').click()
                cy.get('[data-cy="wallet_address"]').invoke('text').as('chainAddress')
                cy.get<string>('@chainAddress').then((chainAddr) => {
                    cy.get('input[class="pk_in"]').eq(0).type(chainAddr)
                })


                cy.getMockResponseData('eth_gasPrice')

                cy.wait('@post_eth_gasPrice').then((intercept) => {
                    const hexGasPrice = intercept.response?.body.result
                    const bnGasPrice = new BN(hexGasPrice.substring(2), 'hex')
                    cy.wrap(bnGasPrice).as('bnGasPrice')
                    console.debug('gasPrice: ', bnGasPrice)
                })

                // Detect Gas Price PRC
                cy.getMockResponseData('eth_estimateGas')

                // Click Confirm Btn
                cy.get('.button_primary').eq(0).click()

                // Detect Estimate Gas Limit RPC
                cy.wait('@post_eth_estimateGas').then((intercept) => {
                    const hexGasLimit = intercept.response?.body?.result
                    const bnGasLimit = new BN(hexGasLimit.substring(2), 'hex')
                    cy.get('.gas_cont')
                        .last()
                        .find('p')
                        .invoke('text')
                        .then((limit) => {
                            expect(limit).to.eq(bnGasLimit.toString())
                        })
                    cy.wrap(bnGasLimit).as('bnGasLimit')
                    console.debug('bnGasLimit: ', bnGasLimit)
                })

                // Verity TransactionFee in screen
                cy.get('.fees > :nth-child(1)')
                    .find('span')
                    .first()
                    .invoke('text')
                    .then(($transactionFee) => {
                        const transactionFee = $transactionFee.replace(/\sCAM/g, '')
                        cy.get<BN>('@bnGasPrice').then((bnGasPrice) => {
                            cy.get<BN>('@bnGasLimit').then((bnGasLimit) => {
                                const txFee = bnGasPrice
                                    .add(bnGasPrice.mul(new BN(25)).div(new BN(100)))
                                    .mul(bnGasLimit)
                                expect(transactionFee).to.eq(bnToAvaxC(txFee))
                            })
                        })
                    })

                // Click Send Transaction Btn
                cy.get('.button_primary').eq(0).click()

                cy.intercept('POST', '**/ext/bc/C/rpc', (request) => {
                    if (
                        request.body.hasOwnProperty('method') &&
                        request.body.method.includes('eth_sendRawTransaction')
                    ) {
                        request.reply({
                            statusCode: 200,
                            fixture: 'mocks/eth_send_raw_transaction.json',
                        })
                        request.alias = 'eth_sendRawTransaction'
                    }
                })

                cy.intercept('POST', '**/ext/bc/C/rpc', (request) => {
                    if (
                        request.body.hasOwnProperty('method') &&
                        request.body.method.includes('eth_getTransactionReceipt')
                    ) {
                        request.reply({
                            statusCode: 200,
                            fixture: 'mocks/eth_get_transaction_receipt.json',
                        })
                        request.alias = 'eth_getTransactionReceipt'
                    }
                })

                cy.wait('@eth_sendRawTransaction').then((intercept) => {
                    const txHash = intercept.response?.body.result
                    cy.contains('Transaction Hash')
                        .siblings('p')
                        .invoke('text')
                        .then((screenTxHash) => expect(screenTxHash.trim()).to.eq(txHash))
                    cy.contains('Transaction Sent')
                })
            }
        })
    })
})

describe('Send: C to C transfer by not balance', () => {
    beforeEach(() => {
        cy.loginWalletWith('privateKey', 'privateKeyZeroBalance')

        cy.get('[data-cy="wallet_transfer"]').click().should('have.class', 'router-link-active')

        // Hidden Show Breakdown
        cy.get('.breakdown_toggle').first().click()

        // Get Own C-Chain Balance
        cy.get('.alt_breakdown > :nth-child(1) > :nth-child(6)')
            .invoke('text')
            .then((balance) => cy.wrap(balance.replace(/\sCAM/g, '')).as('ownChainBalance'))

        // Switch Source Chain to C
        cy.get('.lists > div:nth-child(1) > .chain_select > button:nth-child(2)').click()

        // Input More than Own Amount
        cy.get('.evm_input_dropdown > .col_in > .col_big_in > input').as('inputAmount')
        cy.get<string>('@ownChainBalance').then((balance) => {
            const increaseBalance = parseFloat(balance) + 1
            cy.get('@inputAmount')
                .type(`${increaseBalance}{enter}`)
                .then((input) => {
                    const amount = parseFloat(input.val() as string)
                    expect(amount).to.lte(parseFloat(balance))
                })
        })
    })

    it('verify Fee from C to C', () => {
        // Input C Chain Addr
        cy.get('.bottom_tabs > .chain_select > button:nth-child(3)').click()
        cy.get('[data-cy="wallet_address"]').invoke('text').as('chainAddress')
        cy.get<string>('@chainAddress').then((chainAddr) => {
            cy.get('input[class="pk_in"]').eq(0).type(chainAddr)
        })

        // Click Confirm Btn
        cy.get('.button_primary').eq(0).should('have.attr', 'disabled').and('equal', 'disabled')
    })
})
