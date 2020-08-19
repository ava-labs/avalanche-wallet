describe('Portfolio', () => {
    before(()=>{
        cy.enterWallet();
        cy.wait(1000);
    })

    it('can receive', () => {
        const ADDR_1 = "X-local12rgpghg6gqt23uxqmkcjte0462jjalujg3e5ca";

        cy.send_avax(ADDR_1, 10)
        cy.get('.refresh button').click();
        cy.wait(1000);
        cy.get('[data-cy=wallet_balance]').should('have.text', '0.000000010 AVAX')
    })
});
