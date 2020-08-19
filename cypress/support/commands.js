// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import 'cypress-file-upload';
import {Avalanche} from "avalanche/dist";
const BN = require('bn.js');

import {ZERO, xChain, userKey0, faucetAddress, faucetKeychain, userKeychain, TEST_MNEMONIC} from "./keyChains";


Cypress.Commands.add('connectLocalhost', () => {
    // cy.visit('/')
    cy.get('a.logo').click();
    cy.get('.network_menu').click();
    cy.get('.network_row').eq(1).find('.stat_col button').click();
    cy.wait(1500);
    cy.get('.network_dispose_bg').click();
})

Cypress.Commands.add("access_mnemonic", (mnemonic) => {
    cy.get('[data-cy=access]').click();
    cy.get('a.option').eq(0).click();
    cy.get('textarea').type(mnemonic);
    cy.get('.access').click();
})

Cypress.Commands.add('send_avax', async (address, amount) => {
    let utxoSet = await xChain.getUTXOs([faucetAddress])
    let assetId = await xChain.getAVAXAssetID();

    let sendAmount = new BN(amount);
    let unsigned_tx =  await xChain.buildBaseTx(utxoSet, sendAmount, assetId,[address], [faucetAddress], [faucetAddress] );
    let signed_tx = unsigned_tx.sign(faucetKeychain);

    await xChain.issueTx(signed_tx)
});

Cypress.Commands.add('enterWallet', ()=>{
    cy.visit('/')
    cy.connectLocalhost();
    cy.access_mnemonic(TEST_MNEMONIC);
})

// Send the user's balance back to the faucet
Cypress.Commands.add('clearBalance', async ()=>{
    let usrAddr = userKey0.getAddressString();

    let utxoSet = await xChain.getUTXOs([usrAddr])
    let assetId = await xChain.getAVAXAssetID();


    let balance = utxoSet.getBalance([userKey0.getAddress()], assetId);

    if(balance.gt(ZERO)){
        let unsigned_tx =  await xChain.buildBaseTx(utxoSet, balance, assetId,[faucetAddress], [usrAddr], [usrAddr] );
        let signed_tx = unsigned_tx.sign(userKeychain);

        await xChain.issueTx(signed_tx)
    }
})

