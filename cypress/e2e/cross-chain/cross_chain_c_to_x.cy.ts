import {
  BN,
  bnToAvaxX,
  bnToBigAvaxC,
  bnToBigAvaxX,
  GasHelper,
  Big,
  numberToBNAvaxC,
} from '@c4tplatform/camino-wallet-sdk'

describe('Cross chain: C to X', { tags: ['@cross-chain'] }, () => {
  context('normal cases: ', () => {
    beforeEach(() => {
      cy.loginWalletWith('privateKey', 'privateKeyCrossChain')
      // Switch to cross chain
      cy.switchToWalletFunctionTab('Cross Chain')
      // Make sure successfully switched to the Cross Chain tab
      cy.get('.wallet_main .head > h1', { timeout: 15000 }).should('have.text', 'Cross Chain')

      // RPC aliases
      cy.intercept('POST', '**/ext/bc/C/rpc', (request) => {
        if (request.body.method === 'eth_baseFee') {
          request.alias = 'apiBaseFee'
        }
      })
      cy.intercept('POST', '**/ext/bc/X', (request) => {
        if (request.body.method === 'avm.issueTx') {
          request.alias = 'apiImportX'
        } else if (request.body.method === 'avm.getTxStatus') {
          request.alias = 'apiImportXStatus'
        }
      })
      cy.intercept('POST', '**/ext/bc/C/avax', (request) => {
        if (request.body.method === 'avax.issueTx') {
          request.alias = 'apiExportC'
        } else if (request.body.method === 'avax.getAtomicTxStatus') {
          request.alias = 'apiExportCStatus'
        }
      })
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

      const amount = '0.001'
      // enter amount to transfer
      cy.get('.swap_form .avax_input input[type="number"]').type(amount)

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
      cy.get('[data-cy="wallet_address"').invoke('text').then(address => cy.wrap(address.trim()).as('fromAddress'))
      // get to - P address(hard-coded)
      // !! Don't know why it is hard-coded in source to get P-chain address regardless of the chain selected
      cy.get('.bottom_tabs .chain_select button:nth-child(2)').click()
      cy.get('[data-cy="wallet_address"').invoke('text').as('toAddress')

      // use (camino-wallet-sdk).GasHelper to estimate the tx fee of exporting from C chain
      cy.get<string>('@toAddress')
        .then(toAddress => 
          cy.get<string>('@fromAddress')
            .then((fromAddress => ({
              fromAddress,
              toAddress
            })))
        )
        .then(({ fromAddress, toAddress }) => {
          const exportTxFee = GasHelper.estimateExportGasFeeFromMockTx('X', numberToBNAvaxC(amount), fromAddress, toAddress)
          cy.get<BN>('@bnBaseFee')
            .then((baseFee) => {
              console.debug('C base fee(BN): ', baseFee.toString())
              // `getBaseFeeRecommended` function will increase the base fee with 25% up
              const feeWei = baseFee
                .add(baseFee.mul(new BN(25)).div(new BN(100)))
                .mul(new BN(exportTxFee))
              return feeWei
            }).then(feeWei => {
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

          cy.get<string>('@txFee')
            .then((importFee) => {
              console.debug('importFee: ', importFee?.toString())
              cy.get<BigJs.Big>('@exportFee').then((exportFee) =>
                exportFee.plus(bnToBigAvaxX(new BN(importFee)))
              )
            })
            .then((totalFee) => {
              console.debug('totalFee: ', totalFee?.toString())
              cy.get('div')
                .contains('Total')
                .find('span')
                .should('contains.text', `${totalFee?.toString()}`)
            })

          // send tx
          // click CONFIRM button
          cy.get('div.fees:has(> h4) + div button').click()
          // click TRANSFER button
          cy.get('[data-cy="submit"]').click()
          // listening rpcs
          // wait `avax.issueTx` to get txID
          cy.wait('@apiExportC').then((intercept) => {
            const txID = intercept.response?.body.result.txID
            cy.get('.tx_state_card').first().get('.data_row > p').first().should('have.text', txID)
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
            cy.get('.tx_state_card').last().find('.data_row > p').first().should('have.text', txID)
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

          // check the balances on C chain
          cy.get<string>('@initialCBalance')
            .then((initialBalance) => {
              console.debug('initial C balance: ', initialBalance)
                // initial C balance - amount
                return new Big(initialBalance).minus(amount)
              })
        })
        .then((bigBalance) => {
          cy.get<BigJs.Big>('@exportFee').then((exportFee) =>
            // (initial C balance - amount - export fee)
            new Big(bigBalance).minus(exportFee)
          )
        })
        .then((bigBalance) => {
          cy.get<string>('@txFee').then((exportFee) =>
            // ((initial X balance - amount) - export fee) - import fee
            new Big(bigBalance).minus(bnToBigAvaxX(new BN(exportFee)))
          )
        })
        .then((expectedBalance) => {
          cy.get('.chain_card .balance').first().should('have.text', expectedBalance.toString())
        })
        // check the balances on X chain
        cy.get<string>('@initialXBalance')
          .then((initialBalance) => {
            console.debug('initial X balance: ', initialBalance)
            // initial X balance + amount
            return new Big(initialBalance).plus(amount)
          })
          .then((expectedBalance) => {
            cy.get('.chain_card .balance').last().should('have.text', expectedBalance.toString())
          })
    })
  })
})
