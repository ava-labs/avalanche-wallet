describe('Mnemonic Wallet Access', () => {
    it('can access', () => {
        cy.visit('/access/mnemonic')

        let mnemonic = "lamp horror speak web science kingdom gospel switch exile flash copper file powder stereo fever similar worry silent ecology clap step trick assume genre";
        cy.get('textarea').type(mnemonic);
        cy.get('.access').click();
        cy.url().should('include', '/wallet');
    })
});