<template>
    <modal ref="modal" title="Export Transfers" class="modal_main">
        <div class="csv_modal_body">
            <p>Only X chain {{ nativeAssetSymbol }} transactions will be exported.</p>
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
import { CsvRowAvaxTransferData, ITransactionData } from '@/store/modules/history/types'
import { bnToBig } from '@/helpers/helper'
import {
    avaxTransferDataToCsvRow,
    getOutputTotals,
    getOwnedOutputs,
    getNotOwnedOutputs,
    getAssetOutputs,
    getAddresses,
    createCSVContent,
    downloadCSVFile,
    parseMemo,
} from '@/store/modules/history/history_utils'
import { ava } from '@/AVA'
import { BN } from '@c4tplatform/camino'

@Component({
    components: {
        Modal,
    },
})
export default class ExportAvaxCsvModal extends Vue {
    error: Error | null = null

    open(): void {
        this.error = null
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    get canSubmit() {
        return true
    }

    get transactions(): ITransactionData[] {
        return this.$store.state.History.allTransactions
    }

    get wallet() {
        return this.$store.state.activeWallet
    }

    get xAddresses(): string[] {
        return this.wallet.getAllAddressesX()
    }

    get xAddressesStripped(): string[] {
        return this.xAddresses.map((addr: string) => addr.split('-')[1])
    }

    get avaxID() {
        return this.$store.state.Assets.AVA_ASSET_ID
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }

    generateCSVFile() {
        let myAddresses = this.xAddressesStripped
        let avaxID = this.avaxID

        let txs = this.transactions.filter((tx) => {
            let avaxOutAmt = tx.outputTotals[avaxID]

            if (!avaxOutAmt) return false

            return tx.type === 'base' || tx.type === 'operation'
        })

        let txFee = ava.XChain().getTxFee()

        let rows: CsvRowAvaxTransferData[] = []
        const ZERO = new BN(0)

        for (let i = 0; i < txs.length; i++) {
            let tx = txs[i]

            let ins = tx.inputs || []
            let inUTXOs = ins.map((input) => input.output)

            let avaxIns = getAssetOutputs(inUTXOs, avaxID)
            let avaxOuts = getAssetOutputs(tx.outputs, avaxID)

            let myIns = getOwnedOutputs(avaxIns, myAddresses)
            let myOuts = getOwnedOutputs(avaxOuts, myAddresses)

            let inTot = getOutputTotals(myIns)
            let outTot = getOutputTotals(myOuts)

            let gain = outTot.sub(inTot)

            let otherIns = getNotOwnedOutputs(avaxIns, myAddresses)
            let otherOuts = getNotOwnedOutputs(avaxOuts, myAddresses)

            // If its only the fee, continue
            if (gain.abs().lte(txFee)) continue

            let isGain = gain.gt(ZERO)

            let fromOwnedAddrs = getAddresses(myIns)
            let toOwnedAddrs = getAddresses(myOuts)

            let fromAddrs = getAddresses(otherIns)
            let toAddrs = getAddresses(otherOuts)

            // Subtract the fee if we sent it
            let sendAmt = isGain ? gain : gain.add(txFee)

            let txParsed: CsvRowAvaxTransferData = {
                txId: tx.id,
                date: new Date(tx.timestamp),
                amount: bnToBig(sendAmt, 9),
                from: isGain ? fromAddrs : fromOwnedAddrs,
                to: isGain ? toOwnedAddrs : toAddrs,
                memo: parseMemo(tx.memo),
                isGain: isGain,
            }
            rows.push(txParsed)
        }

        let csvRows = rows.map((row) => avaxTransferDataToCsvRow(row))
        let headers = [
            'Tx ID',
            'Date',
            'Memo',
            'From',
            'To',
            'Sent/Received',
            'Amount (' + this.$store.getters['Assets/AssetAVA'].symbol + ')',
        ]
        let allRows = [headers, ...csvRows]

        let csvContent = createCSVContent(allRows)
        downloadCSVFile(csvContent, 'avax_transfers')
    }

    submit() {
        try {
            this.error = null
            this.generateCSVFile()
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
