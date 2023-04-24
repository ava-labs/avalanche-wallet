describe('Send: P to P transfer by already owned balance', () => {
    beforeEach(() => {
        cy.loginWalletWith('privateKey')

        cy.intercept('POST', '**/ext/bc/P', (request) => {
            if (request.body.method == 'platform.getUTXOs') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            'encoding': 'hex',
                            'endIndex': {
                                'address': 'P-kopernikus1e0vfxvw5hvy00haua96zzdfgxwv6nq8ptng5h7',
                                'utxo': 'Uex3zijzgoXR2D6d8YyLF6Tc3xJcJdD6JxYRpHH3zhf8t9jYy'
                            },
                            'numFetched': '1',
                            'utxos': ['0x0000a47114e8ae68c763c5320ec6d316854769e95f149354b9ac67e999279b64478f000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76000000070000011f4fe4ab0000000000000000000000000100000001cbd89331d4bb08f7dfbce9742135283399a980e13f46a7ea']
                        }
                    },
                })
            } else if (request.body.method == 'platform.issueTx') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            'txID': '2FRShpVijngNW1FF12ws7DE43Su7ggUXboTMQtRdGQeZP7U1ZL'
                        }
                    },
                })
                request.alias = 'issueTx'
            } else if (request.body.method == 'platform.getTxStatus') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            'status': 'Committed'
                        }
                    },
                })
            } else if (request.body.method == 'platform.spend') {
                request.reply({
                    statusCode: 200,
                    body: {
                        id: request.body.id,
                        jsonrpc: '2.0',
                        result: {
                            ins: '0x000000000001ee9167f3ba0d85ed4584d8ed157ea1672836c8026703f4912141cd0166cfaaf5000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76000000050000011f4ff3ed4000000001000000009d632f28',
                            outs: '0x0000000000015e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76000000070000011f4fe4ab0000000000000000000000000100000001cbd89331d4bb08f7dfbce9742135283399a980e18e45e476',
                            owners: '0x00000000000100000000000000000000000100000001cbd89331d4bb08f7dfbce9742135283399a980e15df8cf45',
                            signers: [['KaqcqRi56CqJruyEJHDooyo6SzA38Fegf']]
                        }
                    },
                })
            }
        })

        cy.get('[data-cy="wallet_transfer"]', { timeout: 15000 })
            .click()
            .should('have.class', 'router-link-active')

        // Hidden Show Breakdown
        cy.get('.breakdown_toggle').first().click()

        // Get Own P-Chain Balance
        cy.get('.alt_breakdown > :nth-child(1) > :nth-child(4)')
            .invoke('text')
            .then((balance) => {
                cy.wrap(balance.replace(/\sCAM/g, '')).as('ownChainBalance')
            })

        // Switch Source Chain to P
        cy.get('.lists > div:nth-child(1) > .chain_select').contains('P').click()

        // Input More than Own Amount
        cy.get('.bigIn').eq(1).as('inputAmount')
        cy.get<string>('@ownChainBalance').then((balance) => {
            const increaseBalance = parseFloat('0.001')
            cy.get('@inputAmount').type(`${increaseBalance}{enter}`, { force: true })
            cy.contains('Token').click({ force: true })
            cy.get('@inputAmount').then((input) => {
                const amount = parseFloat(input.val() as string)
                expect(amount).to.lte(parseFloat(balance))
            })
        })
    })

    it('verify send tx result from P to P', () => {
        cy.get<string>('@ownChainBalance').then((balance) => {
            // Input P Chain Addr
            cy.get('.bottom_tabs > .chain_select > button:nth-child(2)').click()
            cy.get('[data-cy="wallet_address"]').invoke('text').as('chainAddress')
            cy.get<string>('@chainAddress').then((chainAddr) => {
                cy.get('input[class="pk_in"]').eq(1).type(chainAddr, { force: true })
            })

            // Click Confirm Btn
            cy.get('.button_primary').eq(1).click({ force: true })

            // Click Send Transaction Btn
            cy.get('.button_primary').eq(1).click({ force: true })

            cy.wait('@issueTx').then(() => {
                cy.get('div.new_order_Form > div:nth-child(2) > div.checkout > p').should(($p) => {
                    expect($p.first()).to.contain('Transaction Sent')
                })
            })
        })
    })
})
