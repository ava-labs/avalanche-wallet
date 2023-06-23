<template>
    <div class="activity_page">
        <ExportGlacierHistoryModal ref="glacier_csv_modal"></ExportGlacierHistoryModal>
        <div class="explorer_warning" v-if="!hasExplorer">
            <div class="warning_body">
                <h1>{{ $t('activity.no_explorer.title') }}</h1>
                <p>{{ $t('activity.no_explorer.desc') }}</p>
            </div>
        </div>
        <div class="settings">
            <div class="filter_col">
                <div class="filter_cont">
                    <label>
                        Export CSV File (BETA)
                        <span style="font-size: 0.8em; opacity: 0.8" v-if="isCsvDisabled">
                            Not Supported For This Network
                        </span>
                    </label>
                    <div class="csv_buttons">
                        <v-btn
                            x-small
                            depressed
                            class="button_secondary"
                            @click="openGlacierCsvModal"
                            :disabled="isCsvDisabled"
                        >
                            Export History
                        </v-btn>
                    </div>
                </div>
                <div class="filter_cont">
                    <label>{{ $t('activity.label1') }}</label>
                    <RadioButtons :labels="modes" :keys="modeKey" v-model="mode"></RadioButtons>
                </div>
            </div>
            <div v-if="showList">
                <div class="pagination">
                    <p class="date_display">{{ monthNowName }} {{ yearNow }}</p>
                    <div>
                        <button @click="prevPage" :disabled="!isPrevPage">
                            <fa icon="angle-left"></fa>
                        </button>
                        <button @click="nextPage" :disabled="!isNextPage">
                            <fa icon="angle-right"></fa>
                        </button>
                    </div>
                </div>
                <div class="pagination_info">
                    <p>{{ $t('activity.found', [txs.length]) }}</p>
                    <button @click="updateHistory">
                        <fa icon="sync"></fa>
                    </button>
                </div>
            </div>
        </div>
        <div class="tx_table" ref="list">
            <div class="tx_list" v-show="showList">
                <virtual-list
                    v-show="txs.length > 0"
                    :style="{ height: `${listH}px`, overflowY: 'auto' }"
                    :data-key="'txHash'"
                    :data-sources="txsProcessed"
                    :data-component="RowComponent"
                    :keeps="20"
                    ref="vlist"
                    :estimate-size="txsProcessed.length"
                ></virtual-list>
                <div v-if="txs.length === 0" class="empty">
                    <p>{{ $t('activity.empty') }}</p>
                </div>
            </div>
            <div v-if="!showList" class="loading">
                <template v-if="!isError">
                    <Spinner class="spinner"></Spinner>
                    <p>{{ $t('activity.loading') }}</p>
                </template>
                <template v-else>
                    <p>Error Loading Activity History</p>
                    <v-btn @click="updateHistory" class="button_secondary" small depressed>
                        Try Again
                    </v-btn>
                </template>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
    isTransactionC,
    isTransactionX,
    TransactionType,
    TransactionTypeName,
} from '@/js/Glacier/models'

import TxRow from '@/components/wallet/activity/TxRow.vue'
import RadioButtons from '@/components/misc/RadioButtons.vue'
import Spinner from '@/components/misc/Spinner.vue'
//@ts-ignore
import VirtualList from 'vue-virtual-scroll-list'
import { AvaNetwork } from '@/js/AvaNetwork'
import ExportCsvModal from '@/components/modals/ExportCsvModal.vue'
import ExportAvaxCsvModal from '@/components/modals/ExportAvaxCsvModal.vue'
import { WalletType } from '@/js/wallets/types'
import { BlockchainId } from '@avalabs/glacier-sdk'
import ExportGlacierHistoryModal from '@/components/modals/ExportGlacierHistoryModal.vue'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'

type FilterModeType = 'all' | 'transfer' | 'export_import' | 'stake'
type ModeKeyType = 'all' | 'transfer' | 'swap' | 'stake'

const PAGE_LIMIT = 100

const YEAR_MIN = 2020
const MONTH_MIN = 8

@Component({
    name: 'activity',
    components: {
        ExportAvaxCsvModal,
        ExportCsvModal,
        ExportGlacierHistoryModal,
        Spinner,
        TxRow,
        RadioButtons,
        VirtualList,
    },
})
export default class Activity extends Vue {
    mode: ModeKeyType = 'all'
    modes = [
        this.$t('activity.mode1'),
        this.$t('activity.mode2'),
        this.$t('activity.mode3'),
        this.$t('activity.mode4'),
    ]
    modeKey: ModeKeyType[] = ['all', 'transfer', 'swap', 'stake']
    isLoading = false
    pageNow = 0
    RowComponent = TxRow

    monthNow = 0
    yearNow = 0

    listH = 100

    $refs!: {
        csv_modal: ExportCsvModal
        avax_csv_modal: ExportAvaxCsvModal
        glacier_csv_modal: ExportGlacierHistoryModal
    }

    openCsvModal() {
        this.$refs.csv_modal.open()
    }

    openAvaxCsvModal() {
        this.$refs.avax_csv_modal.open()
    }

    openGlacierCsvModal() {
        this.$refs.glacier_csv_modal.open()
    }

    get isCsvDisabled() {
        return !this.hasExplorer || this.isFuji
    }

    get showList(): boolean {
        if (this.isUpdatingAll || this.isLoading || this.isError) return false
        return true
    }

    get isUpdatingAll(): boolean {
        return this.$store.state.History.isUpdatingAll
    }

    get isNextPage() {
        let now = new Date()
        if (this.yearNow < now.getFullYear()) return true
        if (this.monthNow < now.getMonth()) return true
        return false
    }

    get isPrevPage() {
        // if (this.yearNow  now.getFullYear()) return true
        if (this.monthNow === MONTH_MIN && this.yearNow === YEAR_MIN) return false
        return true
    }

    get monthNowName() {
        return this.$t(`activity.months.${this.monthNow}`)
    }

    get activeNetwork(): AvaNetwork | null {
        return this.$store.state.Network.selectedNetwork
    }

    get isMainnet() {
        return this.activeNetwork && isMainnetNetworkID(this.activeNetwork.networkId)
    }

    get isFuji() {
        return this.activeNetwork && isTestnetNetworkID(this.activeNetwork.networkId)
    }

    /**
     * Returns true if conencted to mainnet or fuji
     */
    get hasExplorer() {
        if (!this.activeNetwork) return false
        return this.isMainnet || this.isFuji
    }

    mounted() {
        this.updateHistory()

        let now = new Date()
        this.yearNow = now.getFullYear()
        this.monthNow = now.getMonth()
        this.scrollToTop()
        this.setScrollHeight()
    }
    deleted() {}

    get isError() {
        return this.$store.state.History.isError
    }

    async updateHistory() {
        this.$store.dispatch('History/updateAllTransactionHistory')
    }

    get monthGroups(): any {
        let res: any = {}
        let txs = this.txs

        for (var i = 0; i < txs.length; i++) {
            let tx = txs[i]
            let date = new Date(this.getTxTimestamp(tx))
            // let mom = moment(tx.timestamp)
            let month = date.getMonth()
            let year = date.getFullYear()
            let key = `${month}/${year}`
            if (res[key]) {
                res[key].push(tx)
            } else {
                res[key] = [tx]
            }
        }
        return res
    }

    get allTxs(): TransactionType[] {
        const supportedTypes: TransactionTypeName[] = [
            'BaseTx',
            'ImportTx',
            'ExportTx',
            'OperationTx',
            'AddValidatorTx',
            'AddDelegatorTx',
            'CreateAssetTx',
        ]
        return this.$store.state.History.allTransactions.filter((tx: TransactionType) => {
            return supportedTypes.includes(tx.txType)
        })
    }

    getTxTimestamp(tx: TransactionType) {
        if (isTransactionX(tx) || isTransactionC(tx)) {
            return tx.timestamp * 1000
        } else {
            return tx.blockTimestamp * 1000
        }
    }

    get txs(): TransactionType[] {
        let txs
        switch (this.mode) {
            case 'transfer':
                txs = this.txsTransfer
                break
            case 'swap':
                txs = this.txsSwap
                break
            case 'stake':
                txs = this.txsStake
                break
            default:
                txs = this.allTxs
                break
        }

        let filtered = txs.filter((tx) => {
            let date = new Date(this.getTxTimestamp(tx))

            if (date.getMonth() === this.monthNow && date.getFullYear() === this.yearNow) {
                return true
            }
            return false
        })
        return filtered
    }

    get txsProcessed() {
        let txs = this.txs

        let res = txs.map((tx, index) => {
            let showMonth = false
            let showDay = false

            if (index === 0) {
                showMonth = true
                showDay = true
            } else {
                let txBefore = txs[index - 1]

                let date = new Date(this.getTxTimestamp(tx))
                let dateBefore = new Date(this.getTxTimestamp(txBefore))

                if (dateBefore.getMonth() !== date.getMonth()) {
                    showMonth = true
                    showDay = true
                } else if (dateBefore.getDay() !== date.getDay()) {
                    showDay = true
                }
            }

            return {
                ...tx,
                isMonthChange: showMonth,
                isDayChange: showDay,
            }
        })
        return res
    }

    get pageAmount(): number {
        return Math.floor(this.txs.length / PAGE_LIMIT)
    }

    prevPage() {
        if (this.monthNow === 0) {
            this.yearNow = this.yearNow - 1
            this.monthNow = 11
        } else {
            this.monthNow = this.monthNow - 1
        }
        this.scrollToTop()
        this.setScrollHeight()
    }

    nextPage() {
        if (this.monthNow === 11) {
            this.yearNow = this.yearNow + 1
            this.monthNow = 0
        } else {
            this.monthNow = this.monthNow + 1
        }
        this.scrollToTop()
        this.setScrollHeight()
    }

    get txsTransfer(): TransactionType[] {
        let transferTypes: TransactionTypeName[] = ['BaseTx', 'CreateAssetTx', 'OperationTx']

        return this.allTxs.filter((tx) => {
            return transferTypes.includes(tx.txType)
        })
    }

    get txsSwap(): TransactionType[] {
        let exportTypes: TransactionTypeName[] = ['ExportTx', 'ImportTx']
        return this.allTxs.filter((tx) => {
            return exportTypes.includes(tx.txType)
        })
    }

    get txsStake(): TransactionType[] {
        let stakeTypes: TransactionTypeName[] = ['AddValidatorTx', 'AddDelegatorTx']
        return this.allTxs.filter((tx) => {
            return stakeTypes.includes(tx.txType)
        })
    }

    scrollToTop() {
        //@ts-ignore
        this.$refs.vlist.scrollToIndex(0)
    }
    // The virtual scroll needs to be given a height in pixels
    setScrollHeight() {
        //@ts-ignore
        let h = this.$refs.list.clientHeight
        this.listH = h
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.activity_page {
    position: relative;
    display: grid;
    grid-template-rows: max-content 1fr;
    padding-bottom: 14px;
}

.explorer_warning {
    position: absolute;
    background-color: var(--bg);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;

    h1 {
        font-weight: normal;
        margin-bottom: 14px;
        color: #fff;
    }

    .warning_body {
        display: flex;
        flex-direction: column;
        max-width: 380px;
        background-color: var(--secondary-color);
        color: #fff;
        padding: 30px;
        border-radius: 12px;
    }
}

.header {
    display: flex;
    flex-direction: row;
    align-items: center;

    p {
        margin: 0px 24px !important;
        color: var(--primary-color-light);
        font-size: 22px;
    }
}

.settings {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 12px;
}

.tx_table {
    height: 100%;
    overflow: auto;
    border-top: 2px solid var(--bg-wallet);
    //overflow: scroll;
    //padding-right: 20px;
    //margin-right: 20px;
    //border-right: 1px solid var(--bg-light);
}

.tx_list {
    //max-height: 480px;
    //overflow: scroll;
    height: 100%;
    position: relative;
}

.table_headers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    //border-bottom: 1px solid var(--bg-light);
    //background-color: var(--bg-light);
}

.month_group {
    padding-bottom: 30px;
    border-bottom: 1px solid var(--bg-light);
    margin-bottom: 30px;

    &:last-of-type {
        border: none;
    }
}
.month_label {
    position: sticky;
    top: 0px;
}

.cols {
    height: 100%;
    //overflow: auto;
    //display: grid;
    //grid-template-columns: 1fr 240px;
}

.empty,
.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 18px 12px;
}

.loading {
    background-color: var(--bg-light);
    padding: 30px;
}
.spinner {
    //width: 40px;
    //height: 40px;
    font-size: 32px;
    margin-bottom: 22px;
    color: #1d82bb;
}

.pagination {
    display: flex;
    flex-direction: row;
    align-items: center;
    p {
        margin-right: 12px !important;
    }
    button {
        width: 24px;
        height: 24px;
        border-radius: 3px;
        border: 1px solid var(--secondary-color);
        color: var(--secondary-color);
        margin-left: 6px;
        opacity: 0.6;
        transition-duration: 0.1s;

        &:hover {
            opacity: 1;
        }

        &[disabled] {
            border-color: var(--primary-color-light);
            color: var(--primary-color-light);
            opacity: 0.4;
        }
    }
}

.date_display {
    font-size: 24px;
}

.filter_col {
    //display: flex;
    //flex-direction: row;
    //align-items: center;
}

.filter_cont {
    label {
        font-size: 12px;
        color: var(--primary-color);
    }
}

.pagination_info {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    font-size: 13px;
    color: var(--primary-color-light);
    transition-duration: 0.1s;

    button {
        margin-left: 14px;
        color: var(--secondary-color);
        opacity: 0.6;
        &:hover {
            opacity: 1;
        }
    }
}

.csv_buttons {
    .v-btn {
        margin-right: 1em;
    }
}
@include main.medium-device {
    .pagination {
        p {
            font-size: 18px;
        }
    }
}

@include main.mobile-device {
    .settings {
        display: grid;
        grid-template-columns: none;
        grid-template-rows: auto auto;
    }

    .filter_col {
        grid-row: 2;
        justify-content: center;
    }

    .pagination {
        justify-content: space-between;
        button {
            width: 35px;
            height: 35px;
        }
    }

    .pagination_info {
        justify-content: flex-start;
    }

    .tx_list {
        height: 90vh;
    }
}
</style>
