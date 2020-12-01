describe('Keystore Wallet Access', () => {
    it('can access', () => {
        cy.visit('/access/keystore')
        let fixture = 'keystore_v5.json'
        cy.get('.file_input input').attachFile(fixture)
    })
})
