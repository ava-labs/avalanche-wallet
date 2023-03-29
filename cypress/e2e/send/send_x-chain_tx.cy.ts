// import { BigNumber } from 'bignumber.js'
// import { BN, bnToBigAvaxX } from '@c4tplatform/camino-wallet-sdk'
//
// describe('Send transaction with x-chain balance', { tags: ['@send'] }, () => {
//     beforeEach(() => {
//         // access wallet with private key
//         cy.loginWalletWith('privateKey', 'walletHasXBalance')
//
//         // click Send tab
//         cy.get('[data-cy="wallet_transfer"]').click()
//
//         cy.get('div.new_order_Form > div.lists > div:nth-child(1) > div > button:nth-child(1)').as(
//             'btnSourceX'
//         )
//
//         cy.get('div.header > button:nth-child(3)').as('btnBreakdown')
//
//         cy.get('div.alt_info > div > div:nth-child(1) > p:nth-child(2)').as('pXAvailBalance')
//
//         cy.get('div.max_in_cont.hover_border > div > input').as('inputAmount')
//
//         cy.get('div > div.col_balance > p').as('pMaxBalance')
//
//         cy.get('div.bottom_tabs > div > button:nth-child(1)').as('btnXChain')
//
//         cy.get('div.bottom > div.bottom_rest > p.addr_text').as('pAddress')
//
//         cy.get('[data-cy="wallet_address"]').as('cyWalletAddress')
//
//         cy.get('div.new_order_Form > div:nth-child(2) > div.to_address > div > input').as(
//             'inputToAddress'
//         )
//
//         cy.get('div.new_order_Form > div:nth-child(2) > div.checkout > button').as('btnConfirm')
//
//         cy.get(
//             'div.checkout > button.button_primary.v-btn.v-btn--block.v-btn--depressed.theme--light.v-size--default'
//         ).as('btnSend')
//
//         cy.intercept('POST', '**/ext/bc/X').as('xEndpoints')
//     })
//
//     it('Send transaction with all available x-chain balance', () => {
//         // click Source Chain X
//         cy.get('@btnSourceX').click()
//
//         // click Show Breakdown
//         cy.get('@btnBreakdown').click()
//
//         // get x-chain balance and assert input amount
//         cy.get('@pXAvailBalance')
//             .invoke('text')
//             .then((text) => {
//                 const xAvailBalanceText = text.replace(/[cam\s]/gi, '')
//                 expect(Number(xAvailBalanceText)).to.be.greaterThan(0)
//
//                 // type amount: xAvailBalanceText
//                 cy.get('@inputAmount').type(xAvailBalanceText)
//
//                 // expect input amount changed as displayed max amount
//                 cy.get('@pMaxBalance')
//                     .click()
//                     .invoke('text')
//                     .then((text) => {
//                         const maxBalanceText = text.replace(/[balance:\s]/gi, '')
//                         cy.get('@inputAmount').should('have.value', maxBalanceText)
//                     })
//
//                 // expect input amount changed to (x-chain Available balance - Transaction Fee)
//                 cy.get('@inputAmount')
//                     .invoke('val')
//                     .then((val) => {
//                         cy.get<String>('@txFee').then((txFee) => {
//                             const xTxFee = bnToBigAvaxX(new BN(txFee))
//                             const xAvailBalance = new BigNumber(Number(xAvailBalanceText))
//                             const expectAmount = xAvailBalance.minus(xTxFee)
//                             expect(val).to.equal(expectAmount.toString())
//                         })
//                     })
//             })
//
//         // click x-chain address
//         cy.get('@btnXChain').click()
//
//         // get x-chain address and input ToAddress
//         cy.get('@cyWalletAddress')
//             .invoke('text')
//             .then((text) => {
//                 const xAddressText = text.replace(/[\s]/gi, '')
//                 cy.get('@inputToAddress').type(xAddressText)
//             })
//
//         // click confirm button
//         cy.get('@btnConfirm').click()
//         // click send button
//         cy.get('@btnSend').click()
//
//         cy.wait('@xEndpoints').then((intercept) => {
//             if (intercept.request.body.method === 'avm.issueTx') {
//                 const txID = intercept.response?.body.result.txID
//
//                 // expect display txID
//                 cy.get('div.new_order_Form > div:nth-child(2) > div.checkout > label')
//                     .invoke('text')
//                     .then((text) => {
//                         const txidText = text.split(':')[1].replace(/[\s]/gi, '')
//                         expect(txidText).to.equal(txID.toString())
//                     })
//
//                 // expect txFee equals to (input amounts - output amounts)
//                 cy.get('@currentRpcHost').then((currentRpcHost) => {
//                     cy.request({
//                         method: 'POST',
//                         //  e.g.,  url: 'https://columbus.camino.foundation:443/ext/bc/X',
//                         url:
//                             currentRpcHost.protocol +
//                             '//' +
//                             currentRpcHost.host +
//                             ':' +
//                             currentRpcHost.port +
//                             '/ext/bc/X',
//                         body: {
//                             jsonrpc: '2.0',
//                             id: 1,
//                             method: 'avm.getTx',
//                             params: {
//                                 txID: txID,
//                                 encoding: 'json',
//                             },
//                         },
//                     }).then((response) => {
//                         const outputs = response.body.result.tx.unsignedTx.outputs
//
//                         let totolOutputAmounts = BigNumber(0)
//                         for (const k in outputs) {
//                             const outputAmount = BigNumber(outputs[k].output.amount)
//                             // cy.log('outputAmount', outputAmount.toNumber())
//                             totolOutputAmounts = totolOutputAmounts.plus(outputAmount)
//                         }
//
//                         const inputs = response.body.result.tx.unsignedTx.inputs
//                         let totolInputAmounts = BigNumber(0)
//                         for (const k in inputs) {
//                             const inputAmount = BigNumber(inputs[k].input.amount)
//                             totolInputAmounts = totolInputAmounts.plus(inputAmount)
//                         }
//
//                         cy.get<String>('@txFee').then((txFee) => {
//                             const expectTxFee = totolInputAmounts.minus(totolOutputAmounts)
//                             expect(txFee).to.equal(expectTxFee.toString())
//                         })
//                     })
//                 })
//             }
//         })
//     })
// })
