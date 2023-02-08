import { Avalanche } from '@c4tplatform/caminojs'

describe('Cross chain: X to C', () => {
  before(() => {
    cy.changeNetwork().accessWallet('privateKey')
    // Switch to cross chain
    cy.switchToWalletFunctionTab('Cross Chain')
    // Make sure successfully switched to the Cross Chain tab
    cy.get('.wallet_main .head > h1').should('have.text', 'Cross Chain')
  })

  context('normal cases: ', () => {
    it('export CAM from X to C', () => {
      cy.get('label').contains('Source Chain').siblings('select').first().as('sourceSelect')
      cy.get('label').contains('Destination Chain').siblings('select').first().as('destinationSelect')
      // Switch source and destination chains
      cy.get('@sourceSelect').invoke('val').then(value => {
        if (value !== 'X') {
          cy.get('@sourceSelect').select('X')
        }
      })
      cy.get('@destinationSelect').invoke('val').then(value => {
        if (value !== 'C') {
          cy.get('@destinationSelect').select('C')
        }
      })

      // Intercept API/RPC to get estimated gas fee
      // from source chain
      cy.get('@currentRpcHost').then(rpc => {
        const camino = new Avalanche(rpc.host, rpc.port, rpc.protocol, rpc.networkID)
        const exportFee = camino.XChain().getTxFee()
        return exportFee
      })
      cy.get('div').contains('Export Fee').find('span')
    })
  })
})