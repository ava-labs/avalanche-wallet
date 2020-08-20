import {faucetAddress, userKey0, sendAvax, TEST_MNEMONIC, createFixedCapAsset} from '../support/keyChains';
import {getNFT} from "../support/nftHelper";

describe('Wallet', () => {
    before(()=>{
        cy.wait(1000);
        cy.enterWallet(TEST_MNEMONIC);
        const ADDR_0 = userKey0.getAddressString();
        sendAvax(ADDR_0, 1)
        cy.wait(1000);
    })


    it('can send single fungible', async () => {
        cy.get('.refresh button').click();
        cy.wait(1000);
        cy.get("[data-cy=wallet_transfer]").click();
        cy.get('.max_in_cont .bigIn').type("{uparrow}")
        cy.get('.qr_input .pk_in').type(faucetAddress)
        cy.get('.checkout button').click();
        cy.wait(1000);
        cy.get('.refresh button').click();
        cy.get('[data-cy=wallet_balance]').should('have.text', '0 AVAX')
    })
});
