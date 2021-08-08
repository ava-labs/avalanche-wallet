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
import { getPriceAtUnixTime } from '@/helpers/price_helper'
const generate = require('csv-generate')
import moment from 'moment'
import {
    dataToCsvRow,
    durationToString,
    getOutputTotals,
    getOwnedOutputs,
    getRewardOuts,
    getStakeAmount,
} from '@/store/modules/history/utils'

@Component({
    components: {
        Modal,
    },
})
export default class ExportCsvModal extends Vue {
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

            // We dont care about txs not rewarded
            // TODO: we might care later
            if (!isRewarded) continue

            let stakeAmount = getStakeAmount(tx)
            // Use validator end time for both delegation and validations as reward date
            let rewardMoment = moment(tx.validatorEnd * 1000)
            let startMoment = moment(tx.validatorStart * 1000)
            let durationMoment = moment.duration(rewardMoment.diff(startMoment))

            let nodeID = tx.validatorNodeID

            let avaxPrice = getPriceAtUnixTime(rewardMoment.unix() * 1000)

            let myOuts = getOwnedOutputs(tx.outputs, myAddresses)
            let rewardOuts = getRewardOuts(myOuts)
            let rewardAmt = getOutputTotals(rewardOuts)
            let rewardAmtBig = bnToBig(rewardAmt, 9)
            let rewardAmtUsd = avaxPrice ? rewardAmtBig.mul(avaxPrice) : undefined

            // Did this wallet receive any rewards?
            let isRewardOwner = rewardOuts.length > 0

            // Did we send this staking transaction
            let inputOuts = tx.inputs.map((input) => input.output)
            let myInputs = getOwnedOutputs(inputOuts, myAddresses)
            let isInputOwner = myInputs.length > 0

            if (type === 'add_delegator') {
                // Skip if user did not want delegation / fee rewards
                if (!this.showDelegation && !this.showFees) continue

                // If user does not want delegation fees received, continue
                if (!isInputOwner && !this.showFees) continue
                // If user does not want delegation rewards, continue
                if (isInputOwner && !this.showDelegation) continue

                let type: CsvRowTxType = isInputOwner ? 'add_delegator' : 'fee_received'

                //TODO: What if reward went to another wallet?
                // if (rewardOuts.length === 0) {
                // }

                rows.push({
                    txId: txId,
                    txType: type,
                    stakeDate: startMoment,
                    stakeDuration: durationMoment,
                    stakeAmount: bnToBig(stakeAmount, 9),
                    rewardDate: rewardMoment,
                    rewardAmtAvax: rewardAmtBig,
                    rewardAmtUsd: rewardAmtUsd,
                    avaxPrice: avaxPrice,
                    nodeID: nodeID,
                    isRewardOwner: isRewardOwner,
                    isInputOwner: isInputOwner,
                })
            } else {
                // Skip if user did not want validation rewards
                if (!this.showValidation) continue

                rows.push({
                    txId: txId,
                    txType: 'add_validator',
                    stakeDate: startMoment,
                    stakeDuration: durationMoment,
                    stakeAmount: bnToBig(stakeAmount, 9),
                    rewardDate: rewardMoment,
                    rewardAmtAvax: rewardAmtBig,
                    rewardAmtUsd: rewardAmtUsd,
                    avaxPrice: avaxPrice,
                    nodeID: nodeID,
                    isRewardOwner: isRewardOwner,
                    isInputOwner: isInputOwner,
                })
            }
        }

        let headers = [
            'Tx ID',
            'Type',
            'Node ID',
            'Stake Amount',
            'Stake Start Date',
            'Stake Duration',
            'Reward Date',
            'AVAX Price at Reward Date',
            'Reward Received (AVAX)',
            'Reward Received (USD)',
        ]

        // Convert data to valid CSV row string
        let rowArrays = rows.map((rowData) => dataToCsvRow(rowData))

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
