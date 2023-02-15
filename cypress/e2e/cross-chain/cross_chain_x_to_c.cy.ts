import {
  BN,
  bnToAvaxC,
  bnToAvaxX,
  bnToBigAvaxC,
  bnToBigAvaxX,
  GasHelper,
  Big,
} from '@c4tplatform/camino-wallet-sdk'

describe('Cross chain: X to C', { tags: ['@cross-chain'] }, () => {
  context('normal cases: ', () => {
    beforeEach(() => {
      cy.loginWalletWith('privateKey', 'privateKeyCrossChain')
      // Switch to cross chain
      cy.switchToWalletFunctionTab('Cross Chain')
      // Make sure successfully switched to the Cross Chain tab
      cy.get('.wallet_main .head > h1', { timeout: 15000 }).should('have.text', 'Cross Chain')

      // RPC aliases
      cy.intercept('**/ext/bc/C/rpc', (request) => {
        if (request.body.method === 'eth_baseFee') {
          request.alias = 'apiBaseFee'
        }
      })
      cy.intercept('POST', '**/ext/bc/X', (request) => {
        if (request.body.method === 'avm.issueTx') {
          request.alias = 'apiExportX'
        } else if (request.body.method === 'avm.getTxStatus') {
          request.alias = 'apiExportXStatus'
        }
      })
      cy.intercept('POST', '**/ext/bc/C/avax', (request) => {
        if (request.body.method === 'avax.issueTx') {
          request.alias = 'apiImportC'
        } else if (request.body.method === 'avax.getAtomicTxStatus') {
          request.alias = 'apiImportCStatus'
        }
      })
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
      cy.get('.swap_form .avax_input input[type="number"]').type('0.001')

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

        cy.get<string>('@txFee')
          .then((exportFee) => {
            console.debug('exportFee: ', exportFee?.toString())
            cy.get<BigJs.Big>('@importFee').then((importFee) =>
              importFee.plus(bnToBigAvaxX(new BN(exportFee)))
            )
          })
          .then((totalFee) => {
            console.debug('totalFee: ', totalFee?.toString())
            cy.get('div')
              .contains('Total')
              .find('span')
              .should('have.text', `${totalFee?.toString()} CAM`)
          })

        // send tx
        // click CONFIRM button
        cy.get('div.fees:has(> h4) + div button').click()
        // click TRANSFER button
        cy.get('[data-cy="submit"]').click()

        // wait `avm.issueTx` to get txID
        cy.wait('@apiExportX').then((intercept) => {
          const txID = intercept.response?.body.result.txID
          cy.get('.tx_state_card').first().find('.data_row > p').first().should('have.text', txID)
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
          cy.get('.tx_state_card').last().find('.data_row > p').first().should('have.text', txID)
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
              // (initial X balance - amount) - export fee
              new Big(bigBalance).minus(bnToBigAvaxX(new BN(exportFee)))
            )
          })
          .then((bigBalance) => {
            cy.get<BigJs.Big>('@importFee').then((importFee) =>
              // (initial X balance - amount - export fee) - import fee
              new Big(bigBalance).minus(importFee)
            )
          })
          .then((expectedBalance) => {
            cy.get('.chain_card .balance').first().should('have.text', expectedBalance.toString())
          })
        // check the balances on C chain
        cy.get<string>('@initialCBalance')
          .then((initialBalance) => {
            console.debug('initial C balance: ', initialBalance)
            cy.get<string>('@amount').then((amount) => {
              // initial C balance + amount
              return new Big(initialBalance).plus(amount)
            })
          })
          .then((expectedBalance) => {
            cy.get('.chain_card .balance').last().should('have.text', expectedBalance.toString())
          })
      })
    })
  })
})
