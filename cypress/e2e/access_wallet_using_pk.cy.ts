import { expect } from 'chai'
import { accessWallet, changeNetwork, addLocalNetwork } from '../utils/utils'

describe('access wallet', () => {
    before(() => {
        cy.visit('/')
    })
    it('Wallet access private key ', () => {
        //changeNetwork(cy);
        addLocalNetwork(cy)
        accessWallet(cy, 'privateKey')
    })
})
