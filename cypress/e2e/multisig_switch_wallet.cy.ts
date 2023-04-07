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
        cy.get('.button_container').find('button').eq(1).click()
        cy.get('.v-slide-group__content').find('div').eq(5).click()
        cy.get('.fetch_button').click()
        cy.get('.addAliasButton').click()
    })

    it('change to active other key', () => {
        cy.contains('Switch Wallet').click({ force: true })
        cy.contains('Other Keys')
            .parent()
            .find('span > div')
            .eq(0)
            .get('.text_buts')
            .find('div')
            .eq(0)
            .find('button')
            .click({ force: true })

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

        cy.contains('Wallet Switcher').siblings('div').click({ force: true })

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
