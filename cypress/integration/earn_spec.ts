import {faucetAddress, userKey0, sendAvax, TEST_MNEMONIC, createFixedCapAsset} from '../support/keyChains';
import {getNFT} from "../support/nftHelper";

describe('Wallet Earn', () => {


    before(()=>{
        cy.wait(1000);
        cy.enterWallet(TEST_MNEMONIC);
        const ADDR_0 = userKey0.getAddressString();
        sendAvax(ADDR_0, 10000000000000) // 10k AVAX
        cy.wait(4000);
    })


    it('can export X to P',  () => {
        cy.get('[data-cy=wallet_earn]').click()
        cy.get('[data-cy=swap]').click()
        cy.get('.amt_in').type('1000000000000')
        cy.get('[data-cy=submit]').click()
        cy.wait(5000);
        cy.get('.complete').should('exist');
    })

    // it('can delegate', () => {
    //     cy.get('[data-cy=wallet_earn]').click()
    //     cy.get('[data-cy=delegate]').click()
    // })


});
