describe('Wallet Creation', () => {
    it('can create wallet', () => {
        cy.visit('/create')
        cy.get('.but_generate').click()
        cy.get('.checkbox').click()
        cy.get('.verify_cont >  .but_primary').click()

        cy.get('.phrase_raw')
            .invoke('text')
            .then((text) => {
                let mnemonic = text.toString()
                let words = mnemonic.split(' ')

                // Get the input elements from the mnemonic body
                cy.get('.mnemonic_body input').each((input, i) => {
                    let val = input.val()

                    if (!val) {
                        cy.get(input).type(words[i])
                    }
                })

                cy.get('.mnemonic_body .but_primary').click()
                cy.get('.access').click()
                cy.url().should('include', '/wallet')
            })
    })
})
