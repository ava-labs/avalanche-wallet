import { expect } from 'chai'
import { changeNetwork, accessWallet, addKopernikusNetwork } from '../utils/utils'
import moment from 'moment'
import '@cypress/xpath'

let addressFrom = ''
const NETWORK_SWITCHER_BUTTON = '[data-cy="network-switcher"]'
let dataBody = {
    transactions: [
        {
            id: 'EBNhsdSkjzjW5jDKbDrix83ab4F1aTW3attRuM4Afv1FSKXa5',
            chainID: '2mvrUCxfWijcFkj64Swh3eMdpefqs9MgFBddjBFbQ2Abtfugtn',
            type: 'base',
            inputs: [
                {
                    output: {
                        id: 'B5NHjtPuQ1xRbVDvQtdZLCnabN6muptkkqaC3FmomrbJzDXRN',
                        transactionID: 'BKFLodQvoF7aL2oZHQdwqARJ9Pv6YjFK4zjWixxjiJhfndyNK',
                        outputIndex: 1,
                        assetID: '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9',
                        stake: false,
                        frozen: false,
                        stakeableout: false,
                        genesisutxo: false,
                        outputType: 7,
                        amount: '988989811991894750',
                        locktime: 0,
                        stakeLocktime: 0,
                        threshold: 1,
                        addresses: ['kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3'],
                        caddresses: null,
                        timestamp: '2023-02-01T21:39:05Z',
                        redeemingTransactionID: 'EBNhsdSkjzjW5jDKbDrix83ab4F1aTW3attRuM4Afv1FSKXa5',
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
                            address: 'kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3',
                            public_key: 'AtViX1NBqCTfY88owlAuDUvTSX+frSGcAslKhxX1G6fs',
                            signature:
                                's0MgM3Zc9PxY2ZMnLumHb4EaT6Xfmab9MNnRlL0ST29jPtzldom7I8VR5jnBDkkJHjLUpWlBqNyaXemGsdFeqAA=',
                        },
                    ],
                },
            ],
            outputs: [
                {
                    id: 'kAY1gHrHayDmm6i6eEmhDVtGbLudpZUxs5DiSmkqxiN8L65kM',
                    transactionID: 'EBNhsdSkjzjW5jDKbDrix83ab4F1aTW3attRuM4Afv1FSKXa5',
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
                    addresses: ['kopernikus1ndnwhf6q6awh8fwv2q2czjg4ykwtnczgkdyak8'],
                    caddresses: null,
                    timestamp: `${moment().format('YYYY-MM-DD')}T21:41:31Z`,
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
                    id: '2ndn17w2fRodXufNiRLheSJqpV2zbWxhZ8etbQrxuoeicQ2y7E',
                    transactionID: 'EBNhsdSkjzjW5jDKbDrix83ab4F1aTW3attRuM4Afv1FSKXa5',
                    outputIndex: 1,
                    assetID: '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9',
                    stake: false,
                    frozen: false,
                    stakeableout: false,
                    genesisutxo: false,
                    outputType: 7,
                    amount: '988989796990894750',
                    locktime: 0,
                    stakeLocktime: 0,
                    threshold: 1,
                    addresses: ['kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3'],
                    caddresses: null,
                    timestamp: `${moment().format('YYYY-MM-DD')}T21:41:31Z`,
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
            memo: 'VGVzdA==',
            inputTotals: {
                '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9': '988989811991894750',
            },
            outputTotals: {
                '2Q4U5CR7YVtkm12CrTjg4kcfZvu2ckET34VrxbZeEz7183yXW9': '988989811990894750',
            },
            reusedAddressTotals: null,
            timestamp: `${moment().format('YYYY-MM-DD')}T21:41:31Z`,
            txFee: 1000000,
            genesis: false,
            rewarded: false,
            rewardedTime: null,
            epoch: 0,
            vertexId: '2CDhTMVBKfHQkGCd99dRAGaFG9S2GsfsXFGEW5tWQgNybbMzjo',
            validatorNodeID: '',
            validatorStart: 0,
            validatorEnd: 0,
            txBlockId: '',
        },
    ],
    startTime: '0001-01-01T00:00:00Z',
    endTime: `${moment().format('YYYY-MM-DD')}T23:59:59Z`,
}

describe('Activity Transactions', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        return false
    })

    before(() => {
        cy.visit('/')
    })

    it('access activity transactions', () => {
        addKopernikusNetwork(cy)
        //changeNetwork(cy);

        accessWallet(cy, 'mnemonic')
        cy.wait(10000)
        cy.get('[data-cy="wallet_address"]', { timeout: 12000 }).should('be.visible')
        cy.get('[data-cy="wallet_address"]', { timeout: 12000 })
            .invoke('text')
            .then((textAddress) => {
                let addressValidate = textAddress.replace('\n', '').replace(' ', '').split('X-')
                let address = addressValidate[1].split('\n')[0]
                dataBody.transactions[0].outputs[0].addresses[0] = address

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
                        let chainID = req.body.chainID[0]
                        dataBody.transactions[0].chainID = chainID
                        dataBody.transactions[0].inputs[0].output.chainID = chainID
                        dataBody.transactions[0].outputs[0].chainID = chainID
                        dataBody.transactions[0].outputs[1].chainID = chainID
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
                    })

                cy.log('Table Ok')
                cy.get('.time', { timeout: 7000 })
                    .invoke('text')
                    .then((text) => {
                        cy.log('Continue Process')
                        let splittedDate = text.split(' ')
                        let dateMap = splittedDate.filter((text) => text != '' && text != '\n')

                        //let dayStr = dateMap[0];
                        let monthStr = dateMap[1]
                        let dayNumberStr = dateMap[2]
                        let yearStr = dateMap[3].replace('\n', '')
                        let hourStr = dateMap[4]
                        var rxHour = /\w/g
                        let arrHour: any = rxHour.exec(dateMap[5])
                        let timeInputComplete = `${dayNumberStr}/${monthStr}/${yearStr} ${hourStr} ${arrHour[0]}m`
                        let dateUTC = moment(
                            timeInputComplete,
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
                            })
                    })
            })
    })
})
