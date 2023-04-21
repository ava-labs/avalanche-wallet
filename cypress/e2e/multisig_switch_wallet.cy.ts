describe('multisig: switch wellet', () => {
    beforeEach(() => {
        cy.loginWalletWith('privateKey', 'multisigAliasPrivateKey')
        cy.switchToWalletFunctionTab('Manage Keys')
        cy.intercept('GET', '**/v2/multisigalias/*', (request) => {
            request.reply({
                statusCode: 200,
                body: {
                    alias: [
                        'kopernikus18gw475en5h5jvtkslp7xqed7t7ugq6rmc4zrvh',
                        'kopernikus12tqp70mm2ak9lfh9j9eqyldkpey5ntlxduct37',
                        'kopernikus1whcusz08xtlx0dgmrsxqt7a8gupgzd32r5stpy',
                    ],
                },
            })
        })

        cy.intercept('POST', '**/ext/bc/P', (request) => {
            if (request.body.method === 'platform.getMultisigAlias') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            addresses: [
                                'P-kopernikus1qfyvkqnv8yd9rmlf6sv0gdx20dgg4erslxurav',
                                'P-kopernikus1yk9lw48um0r0rn9ydf9fhjfwwfq0qh7qpytjcr',
                                'P-kopernikus1fvr4nd743ew0gcy00se24hp2ecpmk4h7lhkll4',
                                'P-kopernikus1dgrg4j4p5e6k5jn8080n6333r934pyum0zgczg',
                                'P-kopernikus10xf9u6we06ljq20jtq90hj0f6q8l2psp0njqmu',
                                'P-kopernikus102uap4au55t22m797rr030wyrw0jlgw25ut8vj',
                                'P-kopernikus1c35zu69gd42yu9ecrptzwf0z9g7fhfvrmrjgam',
                                'P-kopernikus1maff3tql60ndkwn9mvz06ssywvag4uf48el62q',
                                'P-kopernikus1lmwsgy9zv8hyxwsek0pvsq7cpejtkvwk2nm7k0',
                            ],
                            memo: '0x31303031',
                            threshold: '2',
                        },
                    },
                })
            }
        })

        cy.intercept('POST', '**/ext/bc/X', (request) => {
            if (request.body.method === 'avm.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            encoding: 'hex',
                            endIndex: {
                                address: 'X-kopernikus1maff3tql60ndkwn9mvz06ssywvag4uf48el62q',
                                utxo: '5EHYBsL9HbHS1yHgp9dQCYZKy7C8VB3J4roTQ5FBJmqr65G8T',
                            },
                            numFetched: '2',
                            utxos: [
                                '0x0000bd2fcdf4cb5f5cdad2516397155d28474cab585134824db35107af86f5180bdf000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76000000070000001694a615a800000000000000000000000100000001df5298ac1fd3e6db3a65db04fd4204733a8af13523b9a8a6',
                                '0x0000b392b7aabdb825257857ac7bd087fdb8c10290ac561c561a8c1e71346085091f000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000000000098968000000000000000000000000100000001df5298ac1fd3e6db3a65db04fd4204733a8af1358dc4f97d',
                                '0x000074586670c1bf26ffbd7af84e4298a3e19c05fb8235fc2f19459fe2f930a283a4000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000000003b9aca0000000000000000000000000100000001df5298ac1fd3e6db3a65db04fd4204733a8af135e77d4535',
                                '0x00005d59e292133376a3ec90f6fb64e6f77d0745cced9d15ea861ee0c95a636705fc000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000000003b9aca0000000000000000000000000100000001df5298ac1fd3e6db3a65db04fd4204733a8af1356e6bd739',
                            ],
                        },
                    },
                })
            }
        })

        cy.intercept('POST', '**/ext/bc/P', (request) => {
            if (request.body.method === 'platform.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            encoding: 'hex',
                            endIndex: {
                                address: 'P-kopernikus1maff3tql60ndkwn9mvz06ssywvag4uf48el62q',
                                utxo: 'qisCyQZdJWn1EWbuLoQij299tBKqd4GgKvzfHrCX8cCBxyBcR',
                            },
                            numFetched: '2',
                            utxos: [
                                '0x000081a4fc69d1b7243124b64bea29520a1f8911e16df6b395493b129c4a025f078d000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000008e9bdc4cae800000000000000000000000100000001df5298ac1fd3e6db3a65db04fd4204733a8af1355aca3425',
                                '0x000060591c8a2ce15345374e00462c6a1aba2f5e8a7891a85df37d6a95abbd040ba3000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f760000000700038d7ea4c6800000000000000000000000000100000001df5298ac1fd3e6db3a65db04fd4204733a8af135d138ae14',
                            ],
                        },
                    },
                })
            }
        })

        cy.intercept('POST', '**/ext/bc/C/rpc', (request) => {
            if (request.body.method === 'eth_getBalance') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: '0x57971e715b9a0e000',
                    },
                })
                request.alias = 'firstPlatformGetUTXOs'
            }
        })

        cy.get('[data-cy="btn-show-breakdown"]').click()
        cy.get('[data-cy="top-balance-available-X"]').as('balanceX')
        cy.get('[data-cy="top-balance-available-P"]').as('balanceP')
        cy.get('[data-cy="top-balance-available-C"]').as('balanceC')
        cy.get('[data-cy="wallet_balance"]').as('totalBalance')
        cy.get('.alt_breakdown').find('div').eq(1).find('p').eq(0).as('Deposited')

        verifyBalance()
    })

    it('change to active other key', () => {
        cy.get('.button_container').find('button').eq(1).click()
        cy.get('.v-slide-group__content').find('div').eq(5).click()
        cy.get('.fetch_button').click()
        cy.contains('Add Multisig Alias').click()
        // cy.contains('Switch Wallet').click({ force: true })
        cy.contains('Other Keys')
            .parent()
            .find('span > div')
            .eq(0)
            .get('.text_buts')
            .find('div')
            .eq(0)
            .find('button')
            .click({ force: true })

        // cy.contains('Wallet Switcher').siblings('div').click({ force: true })

        cy.intercept('POST', '**/ext/bc/X', (request) => {
            if (request.body.method === 'avm.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            encoding: 'hex',
                            endIndex: {
                                address: 'P-kopernikus18gw475en5h5jvtkslp7xqed7t7ugq6rmc4zrvh',
                                utxo: '11111111111111111111111111111111LpoYY',
                            },
                            numFetched: '0',
                            utxos: [],
                        },
                    },
                })
            }
        })

        cy.intercept('POST', '**/ext/bc/P', (request) => {
            if (request.body.method === 'platform.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            encoding: 'hex',
                            endIndex: {
                                address: 'P-kopernikus18gw475en5h5jvtkslp7xqed7t7ugq6rmc4zrvh',
                                utxo: '2LJqAHvJcNULoXwiAYKKRbYu38w3YXk2mMGWcm8SumNnKUYDZQ',
                            },
                            numFetched: '2',
                            utxos: [
                                '0x000046cd6f0bdbaad652fd85ec3c9b297905296f7b43e95c01b594c9fb705f124e65000000225e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000009184e72a000000000000000000000000001000000013a1d5f5333a5e9262ed0f87c6065be5fb880687b04779379',
                                '0x00009d4bebb91763a18161d327c5c377de5d4c4619d4854998a709c5952b5c339a93000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76000020019d4bebb91763a18161d327c5c377de5d4c4619d4854998a709c5952b5c339a9300000000000000000000000000000000000000000000000000000000000000000000000700038d7ea4c68000000000000000000000000001000000013a1d5f5333a5e9262ed0f87c6065be5fb880687b9bf2d983',
                            ],
                        },
                    },
                })
                request.alias = 'platformGetUTXOs'
            }
        })

        cy.wait(1000)
        verifyBalance()
        cy.get('.chain_select').find('button').eq(1).click()
        cy.wait('@platformGetUTXOs').then((intercept) => {
            cy.get('.addr_text')
                .invoke('text')
                .then((text) => {
                    expect(text.replace(/\s/g, '')).to.equal(
                        intercept.response?.body.result.endIndex.address
                    )
                })
        })
    })
})

const clearBalanceFormat = (data: string) => {
    return data.replace(/\sCAM/g, '').replace(/\s/g, '')
}

const verifyBalance = () => {
    cy.get('@balanceX').invoke('text').then((balanceX) => {
        cy.get('@balanceP').invoke('text').then((balanceP) => {
            cy.get('@balanceC').invoke('text').then((balanceC) => {
                cy.get('@Deposited').invoke('text').then((Deposited) => {
                    const totalXPCBalance = parseFloat(clearBalanceFormat(balanceX)) +
                    parseFloat(clearBalanceFormat(balanceP)) +
                    parseFloat(clearBalanceFormat(balanceC)) +
                    parseFloat(clearBalanceFormat(Deposited))
                    
                    cy.get('@totalBalance').invoke('text').then((totalBalance) => {
                        return parseFloat(clearBalanceFormat(totalBalance))
                    }).then((totalBalance) => {
                        expect(totalBalance).to.equal(parseFloat(totalXPCBalance.toFixed(3)))
                    })
                })
            })
        })    
    })
}
