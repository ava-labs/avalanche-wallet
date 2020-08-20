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

    it('can display fungible', async () => {
        const ADDR_0 = userKey0.getAddressString();

        console.log("SEND TO: ",ADDR_0)
        await sendAvax(ADDR_0, 1)
        cy.wait(1000);
        cy.get('.refresh button').click();
        cy.get('[data-cy=wallet_balance]').should('have.text', '0.000000001 AVAX')
    })

    it('can display custom fixed cap asset', async () => {
        const ADDR_0 = userKey0.getAddressString();
        await createFixedCapAsset("Fixed Cap Test", "TEST", ADDR_0,1000);
        cy.wait(1000);
        cy.get('.refresh button').click();
        cy.wait(1000);
        cy.get(".fungibles_view .asset").should('have.length', 2)
    })

    it('can display NFT', async () => {
        const ADDR_0 = userKey0.getAddressString();
        await getNFT('Test NFT', 'NFT', ADDR_0, 'utf8');
        cy.wait(5000)
        cy.get("[data-cy=wallet_nft]").click();
        cy.get('.refresh button').click();

    });

        // it('can send single fungible', () => {
    //     cy.get("[data-cy=wallet_transfer]").click();
    //     cy.get('.max_in_cont .bigIn').type("{uparrow}")
    //     cy.get('.qr_input .pk_in').type(faucetAddress)
    //     cy.get('.checkout button').click();
    //     cy.wait(1000);
    //     cy.get('.refresh button').click();
    //     cy.get('[data-cy=wallet_balance]').should('have.text', '0 AVAX')
    // })
});
