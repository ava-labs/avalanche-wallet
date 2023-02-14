import { expect } from 'chai'
import '@cypress/xpath'
import { changeNetwork, addKopernikusNetwork } from '../utils/utils'
import moment from 'moment'

describe('Wallet Creation', () => {
    before(() => {
        cy.visit('/')
    })

    it('open suite/create wallet', () => {
        //addKopernikusNetwork(cy);
        changeNetwork(cy)
        cy.wait(2000)
        cy.get('[data-cy="app-selector-menu"]').click()
        cy.get('[data-cy="app-selector-Wallet"]').click()
        cy.get('[data-cy="btn-redirect-create-wallet"]').click()
        cy.get('[data-cy="btn-generate-key-phrase"]').click()

        savePhrase().then((wordsPhrase: string[]) => {
            cy.get('[data-cy="checkbox-wrote-key-phrase-secure-location"]').click()
            cy.get('[data-cy="btn-verify-mnemonic"]').click({ force: true })
            for (let i = 0; i < wordsPhrase.length; i++) {
                let indexInput = i + 1
                cy.get(`[data-cy="mnemonic-in-${indexInput}"]`)
                    .invoke('val')
                    .then((val) => {
                        if (val == wordsPhrase[i]) {
                            console.log(val)
                        } else {
                            cy.get(`[data-cy="mnemonic-in-${indexInput}"]`).type(wordsPhrase[i])
                        }
                    })
            }

            cy.get('[data-cy="btn-confirm-verify-new-mnemonic-phrase"]').click()
            cy.wait(2000)

            cy.get('[data-cy="btn-success-mnemonic"]').click({ force: true })
            cy.wait(2000)

            cy.get('[data-cy="app-selector-menu"]').click()
            cy.get('[data-cy="app-selector-Wallet"]').click()
            //cy.writeFile(`cypress/temp/wallets/temp_wallet_${moment().format("YYYY_MM_DD__HH_mm_ss")}.json`, wordsPhrase);
        })
    })
})

function savePhrase(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        cy.get('[data-cy="phrase-raw-created"]')
            .invoke('text')
            .then((text) => {
                let phraseArr: string[] = text
                    .split(' ')
                    .filter((data) => data != '' && data != '\n')
                phraseArr[23] = phraseArr[23].split('\n')[0]
                resolve(phraseArr)
            })
    })
}