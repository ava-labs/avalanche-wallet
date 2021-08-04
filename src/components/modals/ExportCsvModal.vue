<template>
    <modal ref="modal" title="Export CSV" class="modal_main">
        <div class="csv_modal_body">
            <p>Export rewards received as a CSV file. Only rewarded transactions will be shown.</p>
            <div>
                <v-checkbox
                    label="Validation Rewards"
                    dense
                    hide-details
                    v-model="showValidation"
                ></v-checkbox>
                <v-checkbox
                    label="Delegation Rewards"
                    dense
                    hide-details
                    v-model="showDelegation"
                ></v-checkbox>
                <v-checkbox
                    label="Delegation Fees Received"
                    dense
                    hide-details
                    v-model="showFees"
                ></v-checkbox>
            </div>
            <v-btn
                class="button_secondary"
                small
                @click="submit"
                :disabled="!canSubmit"
                depressed
                block
                style="margin-top: 12px"
            >
                Download CSV File
            </v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import { CsvRowData, CsvRowTxType, ITransactionData, UTXO } from '@/store/modules/history/types'
import { bnToBig } from '@/helpers/helper'
import { BN } from 'avalanche'
import Big from 'big.js'
import { getPriceAtUnixTime } from '@/helpers/price_helper'
const generate = require('csv-generate')
import moment from 'moment'

function isArraysOverlap(arr1: any[], arr2: any[]): boolean {
    let overlaps = arr1.filter((item) => arr2.includes(item))
    return overlaps.length > 0
}

function getStakeAmount(tx: ITransactionData): BN {
    let tot = new BN(0)
    for (let assetId in tx.inputTotals) {
        let val = new BN(tx.inputTotals[assetId])
        tot = tot.add(val)
    }
    return tot
}

function getOwnedOutputs(outs: UTXO[], myAddrs: string[]) {
    return outs.filter((out) => {
        let outAddrs = out.addresses
        return isArraysOverlap(myAddrs, outAddrs)
    })
}

function getOutputTotals(outs: UTXO[]) {
    return outs.reduce((acc, out) => {
        return acc.add(new BN(out.amount))
    }, new BN(0))
}

@Component({
    components: {
        Modal,
    },
})
export default class ExportCsvModal extends Vue {
    @Prop({ default: '' }) privateKey!: string

    showValidation = true
    showDelegation = true
    showFees = true

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    get canSubmit() {
        return this.showDelegation || this.showValidation || this.showFees
    }

    get transactions() {
        return this.$store.state.History.allTransactions
    }

    get stakingTxs(): ITransactionData[] {
        return this.$store.getters['History/stakingTxs']
    }

    get wallet() {
        return this.$store.state.activeWallet
    }

    get pAddresses(): string[] {
        return this.wallet.getAllAddressesP()
    }

    get pAddressesStripped(): string[] {
        return this.pAddresses.map((addr: string) => addr.split('-')[1])
    }

    submit() {
        let myAddresses = this.pAddressesStripped

        let rows: CsvRowData[] = []
        for (var i = 0; i < this.stakingTxs.length; i++) {
            let tx = this.stakingTxs[i]

            let type = tx.type
            let isRewarded = tx.rewarded
            let txId = tx.id

            // We dont care abuout txs not rewarded
            // TODO: we might care later
            if (!isRewarded) continue

            let stakeAmount = getStakeAmount(tx)
            // let rewardDate = new Date(tx.rewardedTime)
            let rewardMoment = moment(tx.timestamp)
            // let txDate = new Date(tx.timestamp)
            let txMoment = moment(tx.timestamp)

            let avaxPrice = getPriceAtUnixTime(rewardMoment.unix() * 1000)

            if (type === 'add_delegator') {
                // Skip if user did not want delegation / fee rewards
                if (!this.showDelegation && !this.showFees) continue

                // Did we send this delegation transaction
                let inputAddresses: string[] = []
                tx.inputs.forEach((input) => {
                    let addresses = input.output.addresses
                    inputAddresses.push(...addresses)
                })

                let isInputOwner = isArraysOverlap(inputAddresses, myAddresses)

                // If user does not want delegation fees received, continue
                if (!isInputOwner && !this.showFees) continue
                // If user does not want delegation rewards, continue
                if (isInputOwner && !this.showDelegation) continue

                let type: CsvRowTxType = isInputOwner ? 'add_delegator' : 'fee_received'

                let myOuts = getOwnedOutputs(tx.outputs, myAddresses)
                let myOutsAmt = getOutputTotals(myOuts)
                let rewardAmt: BN

                // If received delegation fee rewards dont subtract the ins
                if (!isInputOwner) {
                    rewardAmt = myOutsAmt
                } else {
                    rewardAmt = myOutsAmt.sub(stakeAmount)
                    //TODO: What if reward went to another wallet?
                }

                // TODO: How to handle if price is unknown?
                let rewardAmtBig = bnToBig(rewardAmt, 9)
                let rewardAmtUsd = rewardAmtBig.mul(avaxPrice || 0)

                rows.push({
                    txId: txId,
                    txType: type,
                    txDate: txMoment,
                    stakeAmount: bnToBig(stakeAmount, 9),
                    rewardDate: rewardMoment,
                    rewardAmtAvax: rewardAmtBig,
                    rewardAmtUsd: rewardAmtUsd,
                    avaxPrice: avaxPrice,
                })
            } else {
                // Skip if user did not want validation rewards
                if (!this.showValidation) continue

                let outVal = getOutputTotals(tx.outputs)
                let rewardAmt = outVal.sub(stakeAmount)

                //TODO: What if reward went to another wallet?

                let rewardAmtBig = bnToBig(rewardAmt, 9)

                // TODO: How to handle if price is unknown?
                let rewardAmtUsd = rewardAmtBig.mul(avaxPrice || 0)

                rows.push({
                    txId: txId,
                    txType: 'add_validator',
                    txDate: txMoment,
                    stakeAmount: bnToBig(stakeAmount, 9),
                    rewardDate: rewardMoment,
                    rewardAmtAvax: rewardAmtBig,
                    rewardAmtUsd: rewardAmtUsd,
                    avaxPrice: avaxPrice,
                })
            }
        }

        let headers = [
            'Tx ID',
            'Type',
            'Tx Date',
            'Stake Amount',
            'Reward Date',
            'Reward Received (AVAX)',
            'Reward Received (USD)',
            'AVAX Price at Reward Date',
        ]
        let rowArrays = rows.map((rowData) => {
            return [
                rowData.txId,
                rowData.txType,
                rowData.txDate.format('MM/DD/YYYY'),
                rowData.stakeAmount.toString(),
                rowData.rewardDate.format('MM/DD/YYYY'),
                rowData.rewardAmtAvax.toString(),
                rowData.rewardAmtUsd?.toString() || '',
                rowData.avaxPrice?.toFixed(2) || '',
            ]
        })

        let csvContent = 'data:text/csv;charset=utf-8,'

        let allRows = [headers, ...rowArrays]
        allRows.forEach(function (arr) {
            let row = arr.join(',')
            csvContent += row + '\r\n'
        })

        var encodedUri = encodeURI(csvContent)
        var link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', 'staking_rewards.csv')
        document.body.appendChild(link) // Required for FF

        link.click() // This will download the data file named "my_data.csv".
        link.remove()
    }
}
</script>
<style scoped lang="scss">
.csv_modal_body {
    width: 420px;
    max-width: 100%;
    padding: 10px 20px;
}
</style>
