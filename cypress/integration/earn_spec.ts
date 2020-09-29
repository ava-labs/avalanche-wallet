import {faucetAddress, userKey0, sendAvax, TEST_MNEMONIC, createFixedCapAsset} from '../support/keyChains';
import {BN} from "avalanche/dist";

describe('Wallet Earn', () => {


    before(()=>{
        cy.wait(1000);
        cy.enterWallet(TEST_MNEMONIC);
        const ADDR_0 = userKey0.getAddressString();
        sendAvax(ADDR_0, 10000000000) // 10 AVAX
        cy.wait(8000);
    })


    it('export X to P form valid',  () => {
        cy.get('[data-cy=wallet_earn]').click()
        cy.get('[data-cy=swap]').click()
        cy.get('.amt_in').type('500');
        cy.get('[data-cy=confirm]').click();

        cy.window().then(win => {
            let wallet = win.app.$store.state.activeWallet;
            const spy = cy.spy(wallet, 'chainTransfer');


            cy.get('[data-cy=submit]').click().then(()=>{
                // expect(wallet.chainTransfer).to.be.called;
                expect(wallet.chainTransfer).should.have.been.calledWith(new BN('500'), 'X')
            })
        })

        // cy.wait(5000);
        // cy.get('.complete').should('exist');
    })

    // it('can delegate', () => {
    //     cy.get('[data-cy=wallet_earn]').click()
    //     cy.get('[data-cy=delegate]').click()
    // })


});
