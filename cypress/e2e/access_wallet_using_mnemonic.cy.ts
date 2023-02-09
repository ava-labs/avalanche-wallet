import { expect } from 'chai'
import '@cypress/xpath'
import { changeNetwork, accessWallet, addLocalNetwork } from '../utils/utils'

describe('Wallet Access Mnemonic', () => {
    before(() => {
        cy.visit('/')
    })

    it('open suite/open wallet using mnemonic', () => {
        addLocalNetwork(cy)
        //changeNetwork(cy);
        accessWallet(cy, 'mnemonic')
    })
})
