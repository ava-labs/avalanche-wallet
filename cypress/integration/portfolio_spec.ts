import {faucetAddress} from '../support/keyChains';

describe('Portfolio', () => {
    before(()=>{
        cy.wait(1000);
        cy.clearBalance();
        cy.enterWallet();
        cy.wait(1000);
    })

    after(() => {
        cy.clearBalance();
    })

    it('can receive', () => {
        const ADDR_1 = "X-local12rgpghg6gqt23uxqmkcjte0462jjalujg3e5ca";

        cy.send_avax(ADDR_1, 1);
        cy.wait(1000);
        cy.get('.refresh button').click();
        cy.get('[data-cy=wallet_balance]').should('have.text', '0.000000001 AVAX')
    })

    it('can send single fungible', () => {
        cy.get("[data-cy=wallet_transfer]").click();
        cy.get('.max_in_cont .bigIn').type("{uparrow}")
        cy.get('.qr_input .pk_in').type(faucetAddress)
        cy.get('.checkout button').click();
        cy.wait(1000);
        cy.get('.refresh button').click();
        cy.get('[data-cy=wallet_balance]').should('have.text', '0 AVAX')
    })
});
