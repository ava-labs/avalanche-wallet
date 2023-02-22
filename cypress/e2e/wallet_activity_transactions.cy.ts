import { expect } from 'chai'
import { changeNetwork, accessWallet, addKopernikusNetwork } from '../utils/utils'
import moment from 'moment'
import '@cypress/xpath'

let addressFrom = ''
const NETWORK_SWITCHER_BUTTON = '[data-cy="network-switcher"]'
let dataBody = {
    transactions: [
        {
            id: 'rKnyjNaApqGErenfMhcjPstr3khEgJEzaqQvi3mgvKvzDPk85',
            chainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
            type: 'base',
            inputs: [
                {
                    output: {
                        id: 'spsenDtEzfMjbH7mN2LHUrowm7fK2pMVNJHKzDEziyNNELYo2',
                        transactionID: '25ZrczjZL3rd97hc2fMaamvq7SZPZqwypNqvCMv5LdtZvUY5zR',
                        outputIndex: 1,
                        assetID: '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9',
                        stake: false,
                        frozen: false,
                        stakeableout: false,
                        genesisutxo: false,
                        outputType: 7,
                        amount: '988989304987000000',
                        locktime: 0,
                        stakeLocktime: 0,
                        threshold: 1,
                        addresses: ['kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3'],
                        caddresses: null,
                        timestamp: '2023-02-20T15:23:37Z',
                        redeemingTransactionID: 'rKnyjNaApqGErenfMhcjPstr3khEgJEzaqQvi3mgvKvzDPk85',
                        chainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
                        inChainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
                        outChainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
                        groupID: 0,
                        payload: '',
                        block: '',
                        nonce: 0,
                        rewardUtxo: false,
                    },
                    credentials: [
                        {
                            address: 'kopernikus1jzw8lvqa3tj7gwgvsmevpm86qfkjhu48r4u950',
                            public_key: 'AtViX1NBqCTfY88owlAuDUvTSX+frSGcAslKhxX1G6fs',
                            signature:
                                'gnY9tagPF0vln0Dhd+eqqWLMZT7rz6S3fsmizaGRb8FBu5NsAmUBPY+035QeqmjNzgfy0iMFyaa6aWDhdC97VAE=',
                        },
                    ],
                },
            ],
            outputs: [
                {
                    id: '2QKpi6cgf4dJXTXSH2UKeyCxMDYqcQVT6FB1NSYiCFB76JXZYV',
                    transactionID: 'rKnyjNaApqGErenfMhcjPstr3khEgJEzaqQvi3mgvKvzDPk85',
                    outputIndex: 0,
                    assetID: '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9',
                    stake: false,
                    frozen: false,
                    stakeableout: false,
                    genesisutxo: false,
                    outputType: 7,
                    amount: '15000000000',
                    locktime: 0,
                    stakeLocktime: 0,
                    threshold: 1,
                    addresses: ['kopernikus1z572smffhgnuccrl7qknrg8flh26w3c94ev0wx'],
                    caddresses: null,
                    timestamp: '2023-02-20T15:52:52Z',
                    redeemingTransactionID: '',
                    chainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
                    inChainID: '',
                    outChainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
                    groupID: 0,
                    payload: '',
                    block: '',
                    nonce: 0,
                    rewardUtxo: false,
                },
                {
                    id: '2GXPVUUxNBgUmW4s4mxKwv6GaMwpRNu7xWcBSvwDzwTcNNuNuq',
                    transactionID: 'rKnyjNaApqGErenfMhcjPstr3khEgJEzaqQvi3mgvKvzDPk85',
                    outputIndex: 1,
                    assetID: '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9',
                    stake: false,
                    frozen: false,
                    stakeableout: false,
                    genesisutxo: false,
                    outputType: 7,
                    amount: '988989289986000000',
                    locktime: 0,
                    stakeLocktime: 0,
                    threshold: 1,
                    addresses: ['kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3'],
                    caddresses: null,
                    timestamp: '2023-02-20T15:52:52Z',
                    redeemingTransactionID: '',
                    chainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
                    inChainID: '',
                    outChainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
                    groupID: 0,
                    payload: '',
                    block: '',
                    nonce: 0,
                    rewardUtxo: false,
                },
            ],
            memo: 'VGVzdCBDWQ==',
            inputTotals: {
                '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9': '988989304987000000',
            },
            outputTotals: {
                '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9': '988989304986000000',
            },
            reusedAddressTotals: null,
            timestamp: '2023-02-20T15:52:52Z',
            txFee: 1000000,
            genesis: false,
            rewarded: false,
            rewardedTime: null,
            epoch: 0,
            vertexId: 'h319EJ9FNhM7D7i3sLu2ohsDQoNQuszyzv8kjezSmyZRuTjfK',
            validatorNodeID: '',
            validatorStart: 0,
            validatorEnd: 0,
            txBlockId: '',
        },
    ],
    startTime: '0001-01-01T00:00:00Z',
    endTime: '2023-02-20T15:53:08Z',
}

describe('Activity Transactions', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        return false
    })

    before(() => {
        cy.visit('/')
    })

    it.skip('access activity transactions', () => {
        addKopernikusNetwork(cy)
        //changeNetwork(cy);

        accessWallet(cy, 'mnemonic')
        cy.wait(10000);
        cy.get('[data-cy="wallet_address"]',{ timeout: 12000 }).should('be.visible');
        cy.get('[data-cy="wallet_address"]', { timeout: 12000 })
            .invoke('text')
            .then((textAddress) => {
                let addressValidate = textAddress.replace('\n','').replace(" ",'').split("X-");
                let address = addressValidate[1].split("\n")[0];
                dataBody.transactions[0].outputs[0].addresses[0] = address;
                cy.intercept('POST', '**/v2/transactions', (req) => {
                    if (req.body.chainID[0] == '11111111111111111111111111111111LpoYY') {
                        req.reply({
                            statusCode: 200,
                            body: {
                                transactions: null,
                                startTime: '0001-01-01T00:00:00Z',
                                endTime: '2023-02-07T16:02:18Z',
                            },
                        })
                    } else {
                        req.reply({
                            statusCode: 200,
                            body: dataBody,
                        })
                    }
                }).as('historyTransactions')

                cy.get('[data-cy="wallet_activity"]', { timeout: 60000 }).should('be.visible')
                cy.get('[data-cy="wallet_activity"]').click()

                cy.wait('@historyTransactions')

                cy.get('[data-cy="tx-table-activity"]', { timeout: 7000 }).should('be.visible')
                cy.get('.tx_cols', { timeout: 7000 }).should('be.visible')

                cy.get(
                    '[data-cy="tx-detail-0"] > .infoTx > .utxos > :nth-child(1) > .tx_out > .addresses > p'
                )
                    .invoke('text')
                    .then((textAddress) => {
                        addressFrom = textAddress.replace('from ', '')
                        cy.log(addressFrom)
                    });

                cy.log('Table Ok');
                cy.get('.time', { timeout: 7000 })
                    .invoke('text')
                    .then((text) => {
                        cy.log('Continue Process')

                        let splittedDate = text.split(' ')
                        let dateMap = splittedDate.map((text) => text.trim())
                        let strDateArr = dateMap.filter((text) => text)
                        var textDate = strDateArr.slice(1, 7)
                        let arrStrTextDate = textDate.toString().split(',')
                        let aHourFormat = arrStrTextDate[4].split('.')
                        let hourMorningOrAfternoon = `${aHourFormat[0]}${aHourFormat[1].replace(
                            ' ',
                            ''
                        )}`
                        let str4lformatDate = `${arrStrTextDate[1]}/${arrStrTextDate[0]}/${arrStrTextDate[2]} ${arrStrTextDate[3]} ${hourMorningOrAfternoon}`
                        let dateUTC = moment(
                            str4lformatDate,
                            'DD/MMM/YYYY hh:mm:ss a'
                        ).toISOString()
                        cy.get(
                            '[data-cy="tx-detail-0"] > .infoTx > .utxos > :nth-child(1) > .tx_out > .amount'
                        )
                            .should('be.visible')
                            .invoke('text')
                            .then((textAmount) => {
                                let textAmountArr = textAmount
                                    .split(' ')
                                    .filter(
                                        (textData) =>
                                            textData != '\n' &&
                                            textData != '' &&
                                            textData != 'CAM\n'
                                    )
                                let amount =
                                    parseInt(textAmountArr[0].replace('\n', '')) * 1000000000

                                if (
                                    dateUTC.replace('.000', '') ==
                                        dataBody.transactions[0].outputs[1].timestamp ||
                                    amount ==
                                        parseInt(dataBody.transactions[0].outputs[1].amount) ||
                                    addressFrom == dataBody[0].inputs[0].output.addresses[0]
                                ) {
                                    cy.log('success')
                                } else {
                                    cy.log('failed')
                                }
                            });
                    });
            });
    })
})
