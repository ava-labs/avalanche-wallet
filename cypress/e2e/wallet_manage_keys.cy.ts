import { expect } from 'chai'
import '@cypress/xpath'
import { changeNetwork, accessWallet, addKopernikusNetwork } from '../utils/utils'
import moment from 'moment'
import Web3 from 'web3'

const path: string = '/ext/bc/C/rpc'

describe('Wallet Manage Keys', () => {
    before(() => {
        cy.visit('/')
    })

    it('wallet manage keys', () => {
        //changeNetwork(cy)
        addKopernikusNetwork(cy)

        cy.readFile(`cypress/temp/wallets/mnemonic_wallet.json`).then((mnemonicPhrase) => {
            accessWallet(cy, 'mnemonic')
            cy.get('[data-cy="wallet_manage"]', { timeout: 15000 })
                .click()
                .then(() => {
                    cy.get('[data-cy="manage-key-private-key-c"]', { timeout: 7000 }).click()
                    cy.get('[data-cy="private-key-display"]')
                        .invoke('text')
                        .then((privateKey) => {
                            let web3Validated: boolean = validateWeb3Account(privateKey)
                            if (web3Validated) {
                                cy.log('C Chain Private Key supported with web3')
                                cy.get('[data-cy="btn-modal-close"]', { timeout: 5000 }).click()
                                cy.get('[data-cy="manage-key-mnemonic"]', { timeout: 5000 }).click()
                                getKeyPhrase().then((arrKeyPhrase: string[]) => {
                                    let equalsMnemonic = validateMnemonicPhrase(
                                        mnemonicPhrase,
                                        arrKeyPhrase
                                    )
                                    if (equalsMnemonic) {
                                        cy.log('Equals Mnemonics Phrases')
                                    } else {
                                        cy.log('Not Equals Mnemonics Phrases')
                                    }
                                })
                            } else {
                                throw new Error('C Chain Private Key is not supported with web3')
                            }
                        })
                })
        })
    })
})

function validateWeb3Account(privateKey): boolean {
    try {
        let strUrlRpc: any = localStorage.getItem('network_selected')
        let strUrlRpcArr = strUrlRpc.split('"')
        const web3 = new Web3(`${strUrlRpcArr[1]}/${path}`)
        web3.eth.accounts.privateKeyToAccount(privateKey)
        return true
    } catch (e) {
        return false
    }
}

async function getKeyPhrase() {
    let arrKeyPhrase: string[] = []
    for (let i = 1; i <= 24; i++) {
        let phrase: string = await getTextInputKeyPhrase(`[data-cy="mnemonic-keyphrase-${i}"]`)
        arrKeyPhrase.push(phrase)
    }
    return arrKeyPhrase
}

function getTextInputKeyPhrase(cyField: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cy.get(cyField)
            .invoke('text')
            .then((textPhrase: any) => {
                resolve(textPhrase)
            })
    })
}

function validateMnemonicPhrase(keyPhrase: string[], manageKeyMnemonicPhrase: string[]): boolean {
    try {
        for (let i = 0; i < keyPhrase.length; i++) {
            if (keyPhrase[i] != manageKeyMnemonicPhrase[i]) {
                return false
            }
        }
        return true
    } catch (e) {
        return false
    }
}
