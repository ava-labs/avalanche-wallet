import { expect } from 'chai'
import '@cypress/xpath'
import { changeNetwork, accessWallet, addLocalNetwork } from '../utils/utils'

describe('Wallet Balance Mnemonic', () => {
    before(() => {
        cy.visit('/')
    })

    it('open suite/open wallet using mnemonic', () => {
        addLocalNetwork(cy)
        //changeNetwork(cy);
        accessWallet(cy, 'mnemonic')
        interceptXChainBalance()
        interceptPChainBalance()
        interceptChainBalance()

        cy.get('[data-cy="btn-show-breakdown"]', { timeout: 10000 }).should('be.visible')
        cy.get('[data-cy="btn-show-breakdown"]').click()

        cy.get('[data-cy="btn-refresh-balance"]', { timeout: 10000 }).should('be.visible')
        cy.get('[data-cy="btn-refresh-balance"]')
            .click()
            .then(() => {
                cy.wait(3000)
                validateAllBalances()
            })
    })
})

async function interceptXChainBalance() {
    cy.intercept('POST', '**/ext/bc/X', (req) => {
        if (req.body.method == 'avm.getUTXOs') {
            req.reply({
                statusCode: 200,
                body: {
                    jsonrpc: '2.0',
                    result: {
                        numFetched: '2',
                        utxos: [
                            '0x0000a5c08e35b04842fc5fce925ce09cc9f23023d9f2201447f8c71b9e199884a7eb0000000068c1c17ef684ee4260d1c7ab95fe5222dfd7fa60f3363051dae558072101df9b0000000700000005d21dba0000000000000000000000000100000001fa04f66120aa872cb36b6a43eb3e8aecec46c7d45148a7dd',
                            '0x0000c118dce645c6004f9562fb6c3b562fda234445c5c961903284b386e4f41923b20000000068c1c17ef684ee4260d1c7ab95fe5222dfd7fa60f3363051dae558072101df9b0000000700000005d21dba0000000000000000000000000100000001fa04f66120aa872cb36b6a43eb3e8aecec46c7d4a577830c',
                        ],
                        endIndex: {
                            address: 'X-columbus1lgz0vcfq42rjevmtdfp7k052ankyd375puqjpl',
                            utxo: 'p85phsWY6DpHUnQE4TnGvuJ7LXPPvAv9YmENgWqB5YMfpver4',
                        },
                        encoding: 'hex',
                    },
                    id: 40,
                },
            })
        } else {
            console.log('Other query in X Chain')
        }
    })
}

async function interceptPChainBalance() {
    cy.intercept('POST', '**/ext/bc/P', (req) => {
        if (req.body.method == 'platform.getUTXOs') {
            req.reply({
                statusCode: 200,
                body: {
                    jsonrpc: '2.0',
                    result: {
                        numFetched: '1',
                        utxos: [
                            '0x000032a1ac50fac22a8df8b7f13ef31f29d80bd12401bd0363589e8e6d43d7447ef30000000068c1c17ef684ee4260d1c7ab95fe5222dfd7fa60f3363051dae558072101df9b0000000700000002540be40000000000000000000000000100000001fa04f66120aa872cb36b6a43eb3e8aecec46c7d4944987f7',
                        ],
                        endIndex: {
                            address: 'P-columbus1lgz0vcfq42rjevmtdfp7k052ankyd375puqjpl',
                            utxo: '77aytswYfTmMwaPXcV82C3EDicLyHZ11bkdMTsXjixFvyGYVz',
                        },
                        encoding: 'hex',
                    },
                    id: 106,
                },
            })
        } else {
            console.log('Other query in P Chain')
        }
    })
}

async function interceptChainBalance() {
    cy.intercept('POST', '**/ext/bc/C/rpc', (req) => {
        if (req.body.method == 'eth_getBalance') {
            req.reply({
                statusCode: 200,
                body: { jsonrpc: '2.0', id: 8, result: '0x115883a306cfc4200' },
            })
        } else {
            console.log('Other query in C Chain')
        }
    })
}

async function validateAllBalances() {
    let xFunds: number = await getBalanceText('X')

    let cFunds: number = await getBalanceText('C')
    let pFunds: number = await getBalanceText('P')
    let totalFunds: number = await getTotalBalanceText()

    console.log('fundsData', {
        xFunds: xFunds,
        cFunds: cFunds,
        pFunds: pFunds,
        totalFunds: totalFunds,
    })

    let comparativeFunds = xFunds + cFunds + pFunds

    cy.log('totalFunds', {
        totalFundSum: comparativeFunds.toFixed(9),
        totalFundsHTML: totalFunds.toFixed(9),
    })

    if (totalFunds.toFixed(9) != comparativeFunds.toFixed(9)) {
        throw new Error("Funds it's not equals")
    }
}

function getTotalBalanceText(): Promise<number> {
    return new Promise((resolve, reject) => {
        let balanceNumber = '0'
        let balanceDecimals = '.0'
        let balanceTotal = '0'
        cy.get('[data-cy="wallet_balance"]')
            .invoke('text')
            .then((data) => {
                let dataSplit = data.split(' ')
                let dataString = dataSplit.filter(
                    (str) => str != '\n' && str != '' && str != 'CAM\n'
                )
                let value: number = 0
                for (let i = 0; i < dataString.length; i++) {
                    let valueStrNumber = parseFloat(dataString[i])
                    value = value + valueStrNumber
                }
                resolve(value)
            })
    })
}

function getBalanceText(chain: string): Promise<number> {
    return new Promise((resolve, reject) => {
        let attributeFind = ''
        switch (chain) {
            case 'X':
                attributeFind = '[data-cy="top-balance-available-X"]'
                break
            case 'C':
                attributeFind = '[data-cy="top-balance-available-C"]'
                break
            case 'P':
                attributeFind = '[data-cy="top-balance-available-P"]'
                break
            default:
                return 0
        }
        cy.get(attributeFind)
            .invoke('text')
            .then((response) => {
                let fundsSplitted = response.split(' ')
                let fundsString = fundsSplitted.filter(
                    (str) => str != '\n' && str != '' && str != 'CAM\n'
                )
                let funds = parseFloat(fundsString[0])
                resolve(funds)
            })
    })
}
