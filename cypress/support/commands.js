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

import {getPreferredHRP} from "avalanche/dist/utils";
import {bintools} from "../../src/AVA";
import {AVMKeyChain} from "avalanche/dist/apis/avm";


const AVAX_IP = 'localhost';
const AVAX_PORT = '9650';
const AVAX_PROTOCOL = 'http';
const NETWORK_ID = '12345';

const FAUCET_KEY = "PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN";

const USER_ADDR = "X-local12rgpghg6gqt23uxqmkcjte0462jjalujg3e5ca";
const USER_PK = ""



let avalanche = new Avalanche(AVAX_IP, AVAX_PORT, AVAX_PROTOCOL, parseInt(NETWORK_ID), 'X')
let xChain = avalanche.XChain();
let keychain = xChain.keyChain();

const HRP = getPreferredHRP(NETWORK_ID);
const KEY_0 = "PrivateKey-4KsTvehZjr5VKMz9cq9pZQj7i12T8dqW4oz9ZwsTZBujLuYtn";
let userKeychain = new AVMKeyChain(HRP,'X');
    userKeychain.importKey(KEY_0);

let faucetAddressBuf = keychain.importKey(FAUCET_KEY);
let faucetKey = keychain.getKey(faucetAddressBuf);
let faucetAddress = faucetKey.getAddressString()

const TEST_MNEMONIC = "lamp horror speak web science kingdom gospel switch exile flash copper file powder stereo fever similar worry silent ecology clap step trick assume genre";
// const TEST_MNEMONIC2 = "shoulder swarm reward catch ready obtain surprise flame repeat stadium mutual enlist lucky bless zoo glance craft swarm slam fiction virus dream escape early"

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
    let signed_tx = unsigned_tx.sign(keychain);

    await xChain.issueTx(signed_tx)
});

Cypress.Commands.add('enterWallet', ()=>{
    cy.visit('/')
    cy.connectLocalhost();
    cy.access_mnemonic(TEST_MNEMONIC);
})


Cypress.Commands.add('clearBalance', async ()=>{
    let utxoSet = await xChain.getUTXOs([USER_ADDR])

    let sendAmount = new BN(amount);
    let unsigned_tx =  await xChain.buildBaseTx(utxoSet, sendAmount, assetId,[address], [faucetAddress], [faucetAddress] );
    let signed_tx = unsigned_tx.sign(keychain);

    await xChain.issueTx(signed_tx)
})

