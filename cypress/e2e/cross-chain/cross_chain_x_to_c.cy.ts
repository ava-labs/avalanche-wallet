import { BN, bnToAvaxC, bnToAvaxX, bnToBigAvaxC, bnToBigAvaxX, GasHelper } from '@c4tplatform/camino-wallet-sdk'

describe('Cross chain: X to C', { tags: ['@cross-chain'] }, () => {
  context('normal cases: ', () => {
    beforeEach(() => {
      cy.loginWalletWith('privateKey')
      // Switch to cross chain
      cy.switchToWalletFunctionTab('Cross Chain')
      // Make sure successfully switched to the Cross Chain tab
      cy.get('.wallet_main .head > h1', { timeout: 15000 }).should('have.text', 'Cross Chain')

      // RPC aliases
      cy.intercept('**/ext/bc/C/rpc').as('apiBaseFee')
    })

    it('export CAM from X to C', () => {
      cy.get('label').contains('Source Chain').siblings('select').first().as('selectSource')
      cy.get('label').contains('Destination Chain').siblings('select').first().as('selectDestination')
      // Switch source and destination chains
      cy.get('@selectSource').invoke('val').then(value => {
        if (value !== 'X') {
          cy.get('@selectSource').select('X')
        }
      })
      cy.get('@selectDestination').invoke('val').then(value => {
        if (value !== 'C') {
          cy.get('@selectDestination').select('C')
          cy.wait('@apiBaseFee').then(intercept => {
            const hexBaseFee = intercept.response?.body.result
            const bnBaseFee = new BN(hexBaseFee.substring(2), 'hex')
            cy.wrap(bnBaseFee).as('bnBaseFee')
          })
        }
      })

      // the default tx fee of X/P chain is intercepting from rpc on network changed
      // from source chain
      cy.get<string>('@txFee').then(txFee => {
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
        cy.get<BN>('@bnBaseFee').then(baseFee => {
          console.debug('C base fee: ', baseFee.toString())
          // `getBaseFeeRecommended` function will increase the base fee with 25% up
          const feeWei = baseFee.add(baseFee.mul(new BN(25)).div(new BN(100))).mul(new BN(importTxFee))
          console.debug('C import fee: ', bnToAvaxC(feeWei))
          cy.get('div')
            .contains('Import Fee')
            .find('span')
            .should('have.text', `${bnToAvaxC(feeWei)} CAM`)
          cy.wrap(bnToBigAvaxC(feeWei)).as('importFee')
        })

        // check totoal fee
        cy.get('.swap_form')
          .find('input[type="number"]')
          .invoke('val')
          .then(amount => {
            console.debug(`input amount: "${amount}"`)
            cy.get<string>('@txFee')
              .then(exportFee => {
                return bnToBigAvaxX(new BN(exportFee)).plus(String(amount || 0))
              })
          })
          .then(sum => {
            console.debug('sum: ', sum?.toString())
            cy.get<BigJs.Big>('@importFee').then(importFee => importFee.plus(String(sum)))
          })
          .then(totalFee => {
            console.debug('totalFee: ', totalFee?.toString())
            cy.get('div')
              .contains('Total')
              .find('span')
              .should('have.text', `${totalFee?.toString()} CAM`)
          })
      })
    })
  })
})