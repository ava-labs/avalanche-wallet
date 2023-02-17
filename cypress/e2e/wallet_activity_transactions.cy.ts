import { expect } from 'chai'
import { changeNetwork, accessWallet, addKopernikusNetwork } from '../utils/utils'
import moment from 'moment'
import '@cypress/xpath'

let addressFrom = ''
const NETWORK_SWITCHER_BUTTON = '[data-cy="network-switcher"]'
const dataBody = {
    transactions: [
        {
            id: 'm6zFoJuNjcz1qmveuCdiaPdTMp3RzWiaVo52bqfZMJfqoFkE7',
            chainID: '28Pp3JZJBABUmFQcC9ZXPjuDS6WVX8LeQP9y3DvpCXGiNiTQFV',
            type: 'base',
            inputs: [
                {
                    output: {
                        id: 'DNFwfmTqe4tRGJF8miKxPE3rE7cXCr5zQp684jEN6aBxNdm7Z',
                        transactionID: '27nqV5nmi72gCLw748knipGo1UivaN9Pd8CqEo6z78Ki7GuX25',
                        outputIndex: 1,
                        assetID: 'o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW',
                        stake: false,
                        frozen: false,
                        stakeableout: false,
                        genesisutxo: false,
                        outputType: 7,
                        amount: '23843175500',
                        locktime: 0,
                        stakeLocktime: 0,
                        threshold: 1,
                        addresses: ['columbus148fg3zyhua8r0jxpy9wn6pmlkxtfxtxpxn6kt0'],
                        caddresses: null,
                        timestamp: '2023-02-02T22:21:34Z',
                        redeemingTransactionID: 'm6zFoJuNjcz1qmveuCdiaPdTMp3RzWiaVo52bqfZMJfqoFkE7',
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
                            address: 'columbus148fg3zyhua8r0jxpy9wn6pmlkxtfxtxpxn6kt0',
                            public_key: 'AnPbVDf0wv9drwzcMnfJA1Wd66qMpGvwLXdlpApGn7Vb',
                            signature:
                                'y6+7et0x8zltN17hp38AchJ4zBuAHyS4tAceR5Zn+Y0+QuaRzEO0fYTXWWEGvlRMWzhxbPBF1/ZRCsGxhZZi3wA=',
                        },
                    ],
                },
            ],
            outputs: [
                {
                    id: '2H8SzSQPmE632NsEnHmorYPUCVspDTXayetn4ajQo4HjsXZDB8',
                    transactionID: 'm6zFoJuNjcz1qmveuCdiaPdTMp3RzWiaVo52bqfZMJfqoFkE7',
                    outputIndex: 0,
                    assetID: 'o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW',
                    stake: false,
                    frozen: false,
                    stakeableout: false,
                    genesisutxo: false,
                    outputType: 7,
                    amount: '8842175500',
                    locktime: 0,
                    stakeLocktime: 0,
                    threshold: 1,
                    addresses: ['columbus1706ftcn6fw2t4jhawn6c46pf8aycn0yeq4v8cu'],
                    caddresses: null,
                    timestamp: '2023-02-07T15:57:04Z',
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
                    id: '4JGpfzaB1gJfVfBh4KbDsZxLnnpxuwiMuMihCRNMPexS8z7Tn',
                    transactionID: 'm6zFoJuNjcz1qmveuCdiaPdTMp3RzWiaVo52bqfZMJfqoFkE7',
                    outputIndex: 1,
                    assetID: 'o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW',
                    stake: false,
                    frozen: false,
                    stakeableout: false,
                    genesisutxo: false,
                    outputType: 7,
                    amount: '15000000000',
                    locktime: 0,
                    stakeLocktime: 0,
                    threshold: 1,
                    addresses: ['columbus1fq8q9ytacra5ds8y825xa3edjus8wwk78fn5rm'],
                    caddresses: null,
                    timestamp: '2023-02-07T15:57:04Z',
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
            memo: 'VGVzdA==',
            inputTotals: {
                o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW: '23843175500',
            },
            outputTotals: {
                o8seyjX6WupqJ1CE8CeaozK13kqVgc4DFvdvc4crfacLFBauW: '23842175500',
            },
            reusedAddressTotals: null,
            timestamp: '2023-02-07T15:57:04Z',
            txFee: 1000000,
            genesis: false,
            rewarded: false,
            rewardedTime: null,
            epoch: 0,
            vertexId: 'mTLYC4X5KFkUEc54vHaCQS4YYMQp2jWhc2B2FrZhfpYwmR4DD',
            validatorNodeID: '',
            validatorStart: 0,
            validatorEnd: 0,
            txBlockId: '',
        },
    ],
    startTime: '0001-01-01T00:00:00Z',
    endTime: '2023-02-07T16:02:18Z',
}
describe('activity transactions', () => {
    before(() => {
        cy.visit('/')
    })

    it('access activity transactions', () => {
        
        addKopernikusNetwork(cy);
        //changeNetwork(cy);

        let address = [
            "prison",
            "assist",
            "dress",
            "stay",
            "target",
            "same",
            "brown",
            "rally",
            "remove",
            "spice",
            "abstract",
            "liberty",
            "valley",
            "program",
            "wealth",
            "vacuum",
            "claw",
            "cat",
            "april",
            "relief",
            "choice",
            "voyage",
            "toddler",
            "forum"
        ];
        
        accessWallet(cy, 'mnemonic')

        cy.wait(10000)
        cy.get('[data-cy="wallet_activity"]', { timeout: 60000 }).should('be.visible')
        cy.get('[data-cy="wallet_activity"]').click()

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
        })

        cy.get('[data-cy="tx-table-activity"]', { timeout: 7000 }).should('be.visible')
        cy.get('.tx_cols', { timeout: 7000 }).should('be.visible')

        cy.get('[data-cy="tx-detail-0"] > .infoTx > .utxos > :nth-child(1) > .tx_out > .addresses > p')
            .invoke('text')
            .then((textAddress) => {
                addressFrom = textAddress.replace('from ', '')
                cy.log(addressFrom)
            })

        cy.log('Table Ok')
        cy.get('.meta_col > div > .time', { timeout: 7000 })
            .invoke('text')
            .then((text) => {
                cy.log('Continue Process')

                let splittedDate = text.split(' ')
                let dateMap = splittedDate.map((text) => text.trim())
                let strDateArr = dateMap.filter((text) => text)
                var textDate = strDateArr.slice(1, 7)
                let arrStrTextDate = textDate.toString().split(',')
                let aHourFormat = arrStrTextDate[4].split('.')
                let hourMorningOrAfternoon = `${aHourFormat[0]}${aHourFormat[1].replace(' ', '')}`
                let str4lformatDate = `${arrStrTextDate[1]}/${arrStrTextDate[0]}/${arrStrTextDate[2]} ${arrStrTextDate[3]} ${hourMorningOrAfternoon}`
                let dateUTC = moment(str4lformatDate, 'DD/MMM/YYYY hh:mm:ss a').toISOString()
                cy.get('[data-cy="tx-detail-0"] > .infoTx > .utxos > :nth-child(1) > .tx_out > .amount')
                    .should('be.visible')
                    .invoke('text')
                    .then((textAmount) => {
                        let textAmountArr = textAmount
                            .split(' ')
                            .filter(
                                (textData) =>
                                    textData != '\n' && textData != '' && textData != 'CAM\n'
                            )
                        let amount = parseInt(textAmountArr[0].replace('\n', '')) * 1000000000

                        if (
                            dateUTC.replace('.000', '') ==
                                dataBody.transactions[0].outputs[1].timestamp ||
                            amount == parseInt(dataBody.transactions[0].outputs[1].amount)
                            || addressFrom == dataBody[0].inputs[0].output.addresses[0]
                        ) {
                            cy.log('success')
                        } else {
                            cy.log('failed')
                        }
                    })
            })
    })
})