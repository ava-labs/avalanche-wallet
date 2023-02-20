import { expect } from 'chai'
import '@cypress/xpath'
import { changeNetwork, accessWallet } from '../utils/utils'

describe('Wallet Access Mnemonic', () => {
    before(() => {
        cy.viewport(1440, 1080)
        cy.visit('/')
    })


    it('open suite/open wallet using mnemonic', () => {
        console.log(transactionsTwo)
        changeNetwork(cy)
        accessWallet(cy, 'mnemonic')
        // cy.intercept('POST', '**/ext/bc/X', (req) => {
        //     console.log('entre al intercept')
        //     if (req.body.method == 'avm.getUTXOs') {
        //         bodyIssue.id = req.body.id
        //         console.log('pase la validacion')
        //         req.reply({
        //             statusCode: 200,
        //             body: bodyIssue,
        //         })
        //     } else {
        //         console.log('Other query in X Chain')
        //     }
        // })
        cy.get('.refresh > button > .v-icon').click()

        // cy.intercept('POST', '**/v2/transactions', (req) => {
        //     console.log('entre al intercept')
        //     req.reply({
        //         statusCode: 200,
        //         body: transactions,
        //     })
        // })
        cy.intercept('POST', '**/ext/bc/X', (req) => {
            console.log('entre al intercept')
            if (req.body.method == 'avm.getUTXOs') {
                bodyIssue.id = req.body.id
                console.log('pase la validacion')
                req.reply({
                    statusCode: 200,
                    body: bodyIssue,
                })
            } else {
                console.log('Other query in X Chain')
            }
        }).as('balance')
        cy.get('[data-cy="wallet_studio"]').click()
        cy.get('#wallet_router > div.menu > div > div:nth-child(1) > button').click()
        cy.get('[style="flex-grow: 1;"] > input').type('Test2')
        cy.get('.symbol > input').type('TES')
        cy.get('.refresh > button > .v-icon').click()
        cy.wait('@balance')
        cy.get('.button_secondary').click()
    })
})
let transactions = {
    transactions: [
        {
            id: '2Bt1dBGwScEav7iqgejHDP2Gdv6QbR1NvCfH89bZ5SQ74qCMQw',
            chainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
            type: 'base',
            inputs: [
                {
                    output: {
                        id: 'GefaNnTbkwqK73gqXRJsXRJpvfsDu6R821ZhGVnLj7Rf8qrcZ',
                        transactionID: '5KkSis6MPs4D3bfXYdhAXtB88ZagZoXzWcnMLiQSS81GWNGiV',
                        outputIndex: 1,
                        assetID: 'o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW',
                        stake: false,
                        frozen: false,
                        stakeableout: false,
                        genesisutxo: false,
                        outputType: 7,
                        amount: '358242741000000',
                        locktime: 0,
                        stakeLocktime: 0,
                        threshold: 1,
                        addresses: ['columbus1zawetvfggky6yvx5wdcn0tjsalw9ql9dz537x7'],
                        caddresses: null,
                        timestamp: '2023-02-16T14:43:45Z',
                        redeemingTransactionID:
                            '2Bt1dBGwScEav7iqgejHDP2Gdv6QbR1NvCfH89bZ5SQ74qCMQw',
                        chainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                        inChainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                        outChainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                        groupID: 0,
                        payload: '',
                        block: '',
                        nonce: 0,
                        rewardUtxo: false,
                    },
                    credentials: [
                        {
                            address: 'columbus1zawetvfggky6yvx5wdcn0tjsalw9ql9dz537x7',
                            public_key: 'AmSGBLZe0jjbbH2ouSC91wnP56KDBUcBQMescyzZCJ3h',
                            signature:
                                'MqTWD3Up37XjOnWElAh4XgLKHjMQjH9Z/1vuKe1UfWMbvVs7Gsvx6GA7e43TOdWQl1zrfApO9EgQmJTzIgYMhQE=',
                        },
                    ],
                },
            ],
            outputs: [
                {
                    id: '2GzZgk3s27inHYhHmnjysKnuVEbaZjvLvXACqBV9xhSX7x44h5',
                    transactionID: '2Bt1dBGwScEav7iqgejHDP2Gdv6QbR1NvCfH89bZ5SQ74qCMQw',
                    outputIndex: 0,
                    assetID: 'o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW',
                    stake: false,
                    frozen: false,
                    stakeableout: false,
                    genesisutxo: false,
                    outputType: 7,
                    amount: '25000000000',
                    locktime: 0,
                    stakeLocktime: 0,
                    threshold: 1,
                    addresses: ['columbus1ckafyustja3l82kxxapvr224pnhpv34rh55537'],
                    caddresses: null,
                    timestamp: '2023-02-16T19:56:42Z',
                    redeemingTransactionID: '',
                    chainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                    inChainID: '',
                    outChainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                    groupID: 0,
                    payload: '',
                    block: '',
                    nonce: 0,
                    rewardUtxo: false,
                },
                {
                    id: '2BxAaxmyej7wjcNG8EkRTZdkXs7tgbZMHXxhToFJzjb3hJmjPR',
                    transactionID: '2Bt1dBGwScEav7iqgejHDP2Gdv6QbR1NvCfH89bZ5SQ74qCMQw',
                    outputIndex: 1,
                    assetID: 'o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW',
                    stake: false,
                    frozen: false,
                    stakeableout: false,
                    genesisutxo: false,
                    outputType: 7,
                    amount: '358217740000000',
                    locktime: 0,
                    stakeLocktime: 0,
                    threshold: 1,
                    addresses: ['columbus1zawetvfggky6yvx5wdcn0tjsalw9ql9dz537x7'],
                    caddresses: null,
                    timestamp: '2023-02-16T19:56:42Z',
                    redeemingTransactionID: '',
                    chainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                    inChainID: '',
                    outChainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
                    groupID: 0,
                    payload: '',
                    block: '',
                    nonce: 0,
                    rewardUtxo: false,
                },
            ],
            memo: 'RGlzY29yZCBmYXVjZXQgVUlEOiA1MjU3MjM1NjQ1MjgzNjk3MDQ=',
            inputTotals: { o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW: '358242741000000' },
            outputTotals: { o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW: '358242740000000' },
            reusedAddressTotals: null,
            timestamp: '2023-02-16T19:56:42Z',
            txFee: 1000000,
            genesis: false,
            rewarded: false,
            rewardedTime: null,
            epoch: 0,
            vertexId: 'HgVvpGCdS9hZW8sjnwGNpRNNcUSs7PV7riMVQ9DEzfb8fm1z1',
            validatorNodeID: '',
            validatorStart: 0,
            validatorEnd: 0,
            txBlockId: '',
        },
    ],
    startTime: '0001-01-01T00:00:00Z',
    endTime: '2023-02-16T19:57:19Z',
}
let bodyIssue = {
    jsonrpc: '2.0',
    result: {
        numFetched: '1',
        utxos: [
            '0x00009c6639ecd000cd10b16cab9457d1600d9ba25f2cf91474655b5eba03cf55832a0000000068c1c17ef684ee4260d1c7ab95fe5222dfd7fa60f3363051dae558072101df9b0000000700000005d21dba0000000000000000000000000100000001c5ba92720b9763f3aac63742c1a9550cee1646a31964abec',
        ],
        endIndex: {
            address: 'X-columbus1a6m5vcrcvyr7hvqj7ud4u8gfzf2nyqhrjc0ldj',
            utxo: '2GzZgk3s27inHYhHmnjysKnuVEbaZjvLvXACqBV9xhSX7x44h5',
        },
        encoding: 'hex',
    },
    id: 11,
}

let transactionsTwo = {
    transactions: null,
    startTime: '0001-01-01T00:00:00Z',
    endTime: '2023-02-14T15:16:59Z',
}
