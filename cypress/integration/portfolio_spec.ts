import {faucetAddress, userKey0, sendAvax, TEST_MNEMONIC, createFixedCapAsset} from '../support/keyChains';
import {getNFT} from "../support/nftHelper";

describe('Wallet', () => {

    before(()=>{
        cy.wait(1000);
        cy.enterWallet(TEST_MNEMONIC);
        cy.wait(1000);
    })

    after(() => {
    })

    it('can display fungible', () => {
        const ADDR_0 = userKey0.getAddressString();
        sendAvax(ADDR_0, 1)
        cy.wait(2000);
        cy.get('.refresh button').click();
        cy.wait(1500);
        cy.get('[data-cy=wallet_balance]').should('have.text', '0.000000001 AVAX')
    })

    it('can display custom fixed cap asset', () => {
        const ADDR_0 = userKey0.getAddressString();
        createFixedCapAsset("Fixed Cap Test", "TEST", ADDR_0,1000);
        cy.wait(1000);
        cy.get('.refresh button').click();
        cy.wait(1000);
        cy.get(".fungibles_view .asset").should('have.length', 2)
    })

    it('can display NFT', () => {
        const ADDR_0 = userKey0.getAddressString();
        getNFT('Test NFT', 'NFT', ADDR_0, 'utf8');
        cy.wait(2000)
        cy.get("[data-cy=wallet_nft]").click();
        cy.get('.refresh button').click();

    });
});
