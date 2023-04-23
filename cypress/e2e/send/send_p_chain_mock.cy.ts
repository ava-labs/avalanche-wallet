// import { BN, bnToAvaxC } from '@c4tplatform/camino-wallet-sdk/dist'

// describe('Send: P to P transfer by already owned balance', () => {
//     beforeEach(() => {
//         cy.loginWalletWith('privateKey')

//         cy.intercept('POST', '**/ext/bc/P', (request) => {
//             if (request.body.method == 'platform.getUTXOs') {
//                 request.reply({
//                     statusCode: 200,
//                     fixture: 'mocks/platform_getUTXOs.json',
//                 })
//             } else if (request.body.method == 'platform.issueTx') {
//                 request.reply({
//                     statusCode: 200,
//                     fixture: 'mocks/platform_issue_tx.json',
//                 })
//                 request.alias = 'issueTx'
//             } else if (request.body.method == 'platform.getTxStatus') {
//                 request.reply({
//                     statusCode: 200,
//                     fixture: 'mocks/platform_get_tx_status.json',
//                 })
//             }
//         })

//         cy.get('[data-cy="wallet_transfer"]', { timeout: 15000 })
//             .click()
//             .should('have.class', 'router-link-active')

//         // Hidden Show Breakdown
//         cy.get('.breakdown_toggle').first().click()

//         // Get Own P-Chain Balance
//         cy.get('.alt_breakdown > :nth-child(1) > :nth-child(4)')
//             .invoke('text')
//             .then((balance) => {
//                 cy.wrap(balance.replace(/\sCAM/g, '')).as('ownChainBalance')
//             })

//         // Switch Source Chain to P
//         cy.get('.lists > div:nth-child(1) > .chain_select').contains('P').click()

//         // Input More than Own Amount
//         cy.get('.bigIn').eq(1).as('inputAmount')
//         cy.get<string>('@ownChainBalance').then((balance) => {
//             const increaseBalance = parseFloat(balance) + 1
//             cy.get('@inputAmount').type(`${increaseBalance}{enter}`, { force: true })
//             cy.contains('Token').click({ force: true })
//             cy.get('@inputAmount').then((input) => {
//                 const amount = parseFloat(input.val() as string)
//                 expect(amount).to.lte(parseFloat(balance))
//             })
//         })
//     })

//     it('verify send tx result from P to P', () => {
//         cy.get<string>('@ownChainBalance').then((balance) => {
//             // Input P Chain Addr
//             cy.get('.bottom_tabs > .chain_select > button:nth-child(2)').click()
//             cy.get('[data-cy="wallet_address"]').invoke('text').as('chainAddress')
//             cy.get<string>('@chainAddress').then((chainAddr) => {
//                 cy.get('input[class="pk_in"]').eq(1).type(chainAddr, { force: true })
//             })

//             // Click Confirm Btn
//             cy.get('.button_primary').eq(1).click({ force: true })

//             // Click Send Transaction Btn
//             cy.get('.button_primary').eq(1).click({ force: true })

//             cy.wait('@issueTx').then(() => {
//                 cy.get('div.new_order_Form > div:nth-child(2) > div.checkout > p').should(($p) => {
//                     expect($p.first()).to.contain('Transaction Sent')
//                 })
//             })
//         })
//     })
// })
