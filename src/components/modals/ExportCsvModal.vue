<template>
    <modal ref="modal" title="Export Rewards CSV" class="modal_main">
        <div class="csv_modal_body">
            <p>Only rewarded transactions will be shown.</p>
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
            <p class="err" v-if="error">{{ error }}</p>
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
import { Vue, Component } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import {
    CsvRowStakingData,
    CsvRowStakingTxType,
    ITransactionData,
} from '@/store/modules/history/types'
import { bnToBig } from '@/helpers/helper'
import { getPriceAtUnixTime } from '@/helpers/price_helper'
import moment from 'moment'
import {
    stakingDataToCsvRow,
    downloadCSVFile,
    getOutputTotals,
    getOwnedOutputs,
    getRewardOuts,
    getStakeAmount,
    createCSVContent,
} from '@/store/modules/history/history_utils'

@Component({
    components: {
        Modal,
    },
})
export default class ExportCsvModal extends Vue {
    showValidation = true
    showDelegation = true
    showFees = true
    error: Error | null = null

    open(): void {
        this.error = null
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

    generateCSVData() {
        let myAddresses = this.pAddressesStripped

        let rows: CsvRowStakingData[] = []
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
            let ins = tx.inputs || []
            let inputOuts = ins.map((input) => input.output)
            let myInputs = getOwnedOutputs(inputOuts, myAddresses)
            let isInputOwner = myInputs.length > 0

            if (type === 'add_delegator') {
                // Skip if user did not want delegation / fee rewards
                if (!this.showDelegation && !this.showFees) continue

                // If user does not want delegation fees received, continue
                if (!isInputOwner && !this.showFees) continue
                // If user does not want delegation rewards, continue
                if (isInputOwner && !this.showDelegation) continue

                let type: CsvRowStakingTxType = isInputOwner ? 'add_delegator' : 'fee_received'

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

        const symbol = this.$store.getters['Assets/AssetAVA'].symbol

        let headers = [
            'Tx ID',
            'Type',
            'Node ID',
            'Stake Amount',
            'Stake Start Date',
            'Stake Duration',
            'Reward Date',
            symbol + ' Price at Reward Date',
            'Reward Received (' + symbol + ')',
            'Reward Received (USD)',
        ]

        // Convert data to valid CSV row string
        let rowArrays = rows.map((rowData) => stakingDataToCsvRow(rowData))

        let allRows = [headers, ...rowArrays]
        let csvContent = createCSVContent(allRows)

        downloadCSVFile(csvContent, 'staking_rewards')
    }

    submit() {
        try {
            this.error = null
            this.generateCSVData()
        } catch (e) {
            this.error = e as Error
        }
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
