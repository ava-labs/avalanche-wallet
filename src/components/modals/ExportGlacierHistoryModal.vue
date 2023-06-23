<template>
    <modal ref="modal" title="Export Transaction History" class="modal_main">
        <div class="csv_modal_body">
            <div>
                <label>Include Chains</label>
                <MultiSelect
                    style="margin: 0px auto"
                    :labels="['X-Chain', 'P-Chain', 'C-Chain']"
                    :keys="initialSelection"
                    v-model="includeChains"
                    :disabled="operationID"
                ></MultiSelect>
                <label>Date Range</label>
                <RadioButtons
                    :labels="timeframeOptions"
                    :keys="timeframeOptions"
                    :disabled="operationID"
                    v-model="timeframe"
                ></RadioButtons>
                <div>
                    <div>
                        <label>From</label>
                        <datetime
                            v-model="formStartISO"
                            type="datetime"
                            class="date"
                            :min-datetime="startDateMin"
                            :max-datetime="startDateMax"
                            :disabled="operationID || timeframe !== 'Custom'"
                        ></datetime>
                    </div>
                    <div>
                        <label>Until</label>
                        <datetime
                            v-model="formEndISO"
                            type="datetime"
                            class="date"
                            :min-datetime="endDateMin"
                            :max-datetime="endDateMax"
                            :disabled="operationID || timeframe !== 'Custom'"
                        ></datetime>
                    </div>
                </div>
            </div>
            <v-btn
                class="button_secondary"
                @click="submit"
                :disabled="!canSubmit"
                depressed
                block
                style="margin-top: 12px"
                v-if="!operationID"
            >
                Generate
            </v-btn>
            <div style="justify-content: center; display: flex; padding: 1em">
                <Spinner v-if="loading"></Spinner>
                <p class="err" v-if="error">{{ error }}</p>
                <p v-if="downloadURL">Your file is ready to download.</p>
            </div>
            <template v-if="downloadURL || error">
                <v-btn
                    :href="downloadURL"
                    download
                    depressed
                    block
                    :disabled="!downloadURL"
                    class="button_primary"
                    v-if="downloadURL"
                >
                    Download
                </v-btn>
                <v-btn variant="text" @click="reset" depressed block class="restart_button">
                    Start Over
                </v-btn>
            </template>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import { BlockchainId, Glacier, OperationStatus } from '@avalabs/glacier-sdk'
import { WalletType } from '@/js/wallets/types'
import MultiSelect from '../misc/MultiSelect.vue'
import glacier from '@/js/Glacier/Glacier'
import Spinner from '@/components/misc/Spinner.vue'
import RadioButtons from '../misc/RadioButtons.vue'
import { setTimeoutInterval } from '@/helpers/setTimeoutInterval'

const DAY = 24 * 60 * 60 * 1000
const MONTH = 30 * DAY

const TIMEOUT_SECONDS = 15

type Timeframe = 'Last 3 Months' | 'Last 6 Months' | 'This Year' | 'Last Year' | 'All' | 'Custom'

@Component({
    components: {
        Modal,
        MultiSelect,
        Spinner,
        RadioButtons,
    },
})
export default class ExportGlacierHistoryModal extends Vue {
    operationID: string | null = null
    downloadURL: string | null = null
    loading = false
    error: Error | null = null
    endDate: Date = new Date()
    startDate: Date = new Date(this.endDate.getTime() - DAY)

    timeframeOptions: Timeframe[] = [
        'Last 3 Months',
        'Last 6 Months',
        'This Year',
        'Last Year',
        'All',
        'Custom',
    ]
    timeframe: Timeframe = 'Last 3 Months'

    includeChains: BlockchainId[] = [
        BlockchainId.X_CHAIN,
        BlockchainId.P_CHAIN,
        BlockchainId.C_CHAIN,
    ]

    formEndISO: string = this.endDate.toISOString()
    formStartISO: string = this.startDate.toISOString()

    intervalPromise: Promise<void> | undefined

    open(): void {
        this.reset()
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    async checkStatus(): Promise<boolean> {
        if (!this.operationID || this.downloadURL) return true

        const res = await glacier.operations.getOperationResult({ operationId: this.operationID })

        if (res.operationStatus == OperationStatus.COMPLETED) {
            this.downloadURL = res.metadata.downloadUrl || null
            this.loading = false
            return true
        } else if (res.operationStatus == OperationStatus.FAILED) {
            this.onError(new Error(res.message))
            return true
        } else if (res.operationStatus !== OperationStatus.RUNNING) {
            this.loading = false
            return true
        }
        return false
    }

    onError(error: any) {
        this.loading = false
        this.error = error
    }

    get initialSelection() {
        return [BlockchainId.X_CHAIN, BlockchainId.P_CHAIN, BlockchainId.C_CHAIN]
    }

    get canSubmit() {
        return this.includeChains.length
        // return this.showDelegation || this.showValidation || this.showFees
    }

    get wallet() {
        return this.$store.state.activeWallet
    }

    get startDateMax() {
        return new Date(this.formEndDate.getTime() - DAY).toISOString()
    }

    get startDateMin() {
        return new Date(1591236400).toISOString()
    }

    get endDateMax() {
        return new Date().toISOString()
    }

    get endDateMin() {
        return new Date(1591236400).toISOString()
    }

    get formStartDate() {
        return new Date(this.formStartISO)
    }

    get formEndDate() {
        return new Date(this.formEndISO)
    }

    @Watch('timeframe', { immediate: true })
    onTimeframe(val: Timeframe) {
        switch (val) {
            case 'Last 3 Months':
                this.formStartISO = this.last3Months.toISOString()
                this.formEndISO = this.dateNow.toISOString()
                break
            case 'Last 6 Months':
                this.formStartISO = this.last6Months.toISOString()
                this.formEndISO = this.dateNow.toISOString()
                break
            case 'This Year':
                this.formStartISO = this.thisYear.toISOString()
                this.formEndISO = this.dateNow.toISOString()
                break
            case 'Last Year':
                this.formStartISO = this.lastYear.toISOString()
                this.formEndISO = this.thisYear.toISOString()
                break
            case 'All':
                this.formStartISO = this.dateAll.toISOString()
                this.formEndISO = this.dateNow.toISOString()
                break
        }
    }

    get dateNow() {
        return new Date()
    }

    get last3Months() {
        const date = new Date(this.dateNow.getTime() - 3 * MONTH)
        return date
    }

    get last6Months() {
        const date = new Date(this.dateNow.getTime() - 6 * MONTH)
        return date
    }

    get thisYear() {
        const date = new Date(`${this.dateNow.getFullYear()}-01-01`)
        return date
    }

    get lastYear() {
        const date = new Date(`${this.thisYear.getFullYear() - 1}-01-01`)
        return date
    }

    get dateAll() {
        const date = new Date(`2020-09-01`)
        return date
    }

    generateCSVData() {
        const w = this.$store.state.activeWallet as WalletType
        if (!w) return
        const start = new Date('2023-01-01')
        const end = new Date()
        w.startTxExportJob(this.formStartDate, this.formEndDate, this.includeChains).then((res) => {
            this.operationID = res.operationId
            this.loading = true

            this.intervalPromise = setTimeoutInterval(
                this.checkStatus,
                2000,
                TIMEOUT_SECONDS * 1000
            ).catch((e) => {
                this.onError(e)
            })
        })
    }

    submit() {
        try {
            this.error = null
            this.generateCSVData()
        } catch (e: any) {
            this.error = e
        }
    }

    reset() {
        this.error = null
        this.operationID = null
        this.downloadURL = null
        this.loading = false
    }
}
</script>
<style scoped lang="scss">
.csv_modal_body {
    width: 480px;
    max-width: 100%;
    padding: 10px 20px;

    label {
        font-size: 0.7em;
        font-weight: bold;
    }
}

.restart_button {
    margin-top: 0.5em;
    background-color: transparent !important;
    color: var(--primary-color);
}
</style>
