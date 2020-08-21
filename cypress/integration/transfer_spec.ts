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


    // it('can send single fungible', async () => {
    //     cy.get('.refresh button').click();
    //     cy.wait(1000);
    //     cy.get("[data-cy=wallet_transfer]").click();
    //     cy.get('.max_in_cont .bigIn').type("{uparrow}")
    //     cy.get('.qr_input .pk_in').type(faucetAddress)
    //     cy.get('.checkout button').click();
    //     cy.wait(1000);
    //     cy.get('.refresh button').click();
    //     cy.get('[data-cy=wallet_balance]').should('have.text', '0 AVAX')
    // })


    it('can add multiple assets', () => {
        cy.get("[data-cy=wallet_transfer]").click();
        cy.wait(2000);
        let address = userKey0.getAddressString();
        createFixedCapAsset('temp1', "TEMA", address, 4000, 4);
        createFixedCapAsset('temp2', "TEMB", address, 1234, 4);
        createFixedCapAsset('temp3', "TEMC", address, 1234, 12);
        cy.wait(3000);
        cy.get('.refresh button').click();
        cy.wait(2000);
        cy.get('.add_asset').click();
        cy.get('.add_asset').click();
        cy.get('.add_asset').click();
        cy.get('.list_item').should('have.length', 4)
    });

    it('can delete added assets', () => {
        cy.get('.list_item .remove_but').each(item => {
            item.click();
        });
        cy.get('.list_item').should('have.length', 1)
    })

    it('can send multiple assets', () => {
        cy.server();
        cy.route({
            method: 'POST',
            url: '/ext/bc/X',
        }).as('avmApi')
        // cy.route('POST', 'localhost:9650/ext/bc/X')
        cy.get('.add_asset').click();
        cy.get('.add_asset').click();
        cy.get('.add_asset').click();

        cy.get('.list_item .max_but').each(item => {
            item.click();
        });
        cy.get('.qr_input .pk_in').type(faucetAddress)
        cy.get('.checkout button').click();
        // cy.wait('@avmApi').then((xhr) => {
        //     // {"jsonrpc":"2.0","result":{"txID":"26XXmvcnSomKiQNJKGjTVCAj6ddwECgUrxsD6cxqepxc8478vh"},"id":25}
        //     console.log(xhr.responseBody);
        //     // assert.isNotNull(xhr.response.body.data, '1st API call has data')
        // })
    });
});
