<template>
    <div class="activity_page">
        <div class="header">
            <h1>Activity</h1>
            <p>{{ txs.length }} transactions found</p>
            <button @click="updateHistory"><fa icon="sync"></fa></button>
        </div>
        <div class="cols">
            <div class="tx_table">
                <div class="pagination">
                    <div>
                        <p>Month</p>
                        <select>
                            <option value="0">January</option>
                            <option value="1">February</option>
                        </select>
                    </div>
                    <div>
                        <p>Year</p>
                        <select>
                            <option value="2021">2020</option>
                            <option value="2020">2020</option>
                        </select>
                    </div>
                    <div>
                        <button @click="prevPage">Prev</button>
                        <button @click="nextPage">Next</button>
                    </div>
                </div>
                <div class="tx_list" v-show="showList">
                    <virtual-list
                        v-show="txs.length > 0"
                        style="height: 400px; overflow-y: auto"
                        :data-key="'id'"
                        :data-sources="txsProcessed"
                        :data-component="RowComponent"
                    ></virtual-list>
                    <!--                    <TxRow v-for="tx in txsProcessed" :key="tx.id" :source="tx"></TxRow>-->
                    <!--                    <MonthGroup-->
                    <!--                        class="month_group"-->
                    <!--                        v-for="month in monthGroups"-->
                    <!--                        :key="month[0].timestamp"-->
                    <!--                        :transactions="month"-->
                    <!--                    ></MonthGroup>-->
                    <div v-if="txs.length === 0" class="empty">
                        <p>No Transactions Found.</p>
                    </div>
                </div>
                <div v-if="!showList" class="loading">
                    <Spinner class="spinner"></Spinner>
                    <p>LoadingTransactions.</p>
                </div>
            </div>
            <div>
                <label>Filter by type</label>
                <RadioButtons :labels="modes" :keys="modeKey" v-model="mode"></RadioButtons>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import {
    ITransactionData,
    ITransactionDataProcessed,
    TransactionType,
} from '@/store/modules/history/types'

import TxRow from '@/components/wallet/activity/TxRow.vue'
import MonthGroup from '@/components/wallet/activity/MonthGroup.vue'
import RadioButtons from '@/components/misc/RadioButtons.vue'
import Spinner from '@/components/misc/Spinner.vue'

type FilterModeType = 'all' | 'transfer' | 'export_import' | 'stake'
type ModeKeyType = 'all' | 'transfer' | 'swap' | 'stake'

//@ts-ignore
import VirtualList from 'vue-virtual-scroll-list'

const PAGE_LIMIT = 100

const YEAR_MIN = 2020

@Component({
    components: {
        Spinner,
        TxRow,
        MonthGroup,
        RadioButtons,
        VirtualList,
    },
})
export default class Activity extends Vue {
    mode: ModeKeyType = 'all'
    modes = ['All', 'Transfer', 'Export & Import', 'Validation & Delegation']
    modeKey: ModeKeyType[] = ['all', 'transfer', 'swap', 'stake']
    isLoading = false
    pageNow = 0
    RowComponent = TxRow

    monthNow = 0
    yearNow = 0

    get showList(): boolean {
        if (this.isUpdatingAll || this.isLoading) return false
        return true
    }

    get isUpdatingAll(): boolean {
        return this.$store.state.History.isUpdatingAll
    }

    mounted() {
        this.updateHistory()

        let now = new Date()
        this.yearNow = now.getFullYear()
        this.monthNow = now.getMonth()
    }

    updateHistory() {
        this.$store.dispatch('History/updateAllTransactionHistory')
    }

    get monthGroups(): any {
        let res: any = {}
        let txs = this.txs

        for (var i = 0; i < txs.length; i++) {
            let tx = txs[i]
            let date = new Date(tx.timestamp)
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

    get allTxs(): ITransactionData[] {
        return this.$store.state.History.allTransactions
    }

    get txs(): ITransactionData[] {
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
            let date = new Date(tx.timestamp)

            if (date.getMonth() === this.monthNow && this.yearNow === this.yearNow) {
                return true
            }
            return false
        })
        return filtered
    }

    get txsProcessed(): ITransactionDataProcessed[] {
        let txs = this.txs

        let res = txs.map((tx, index) => {
            let showMonth = false
            let showDay = false

            if (index === 0) {
                showMonth = true
                showDay = true
            } else {
                let txBefore = txs[index - 1]

                let date = new Date(tx.timestamp)
                let dateBefore = new Date(txBefore.timestamp)

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
    }
    nextPage() {
        if (this.monthNow === 11) {
            this.yearNow = this.yearNow + 1
            this.monthNow = 0
        } else {
            this.monthNow = this.monthNow + 1
        }
    }

    get pageTxs(): ITransactionData[] {
        let start = this.pageNow * PAGE_LIMIT
        return this.txs.slice(start, start + PAGE_LIMIT)
    }

    get txsTransfer(): ITransactionData[] {
        let txs: ITransactionData[] = this.allTxs
        let transferTypes: TransactionType[] = ['base', 'create_asset', 'operation']

        return txs.filter((tx) => {
            let txType = tx.type
            if (transferTypes.includes(txType)) return true

            return false
        })
    }

    get txsSwap(): ITransactionData[] {
        let txs: ITransactionData[] = this.allTxs
        let exportTypes: TransactionType[] = ['import', 'export', 'pvm_import', 'pvm_export']

        return txs.filter((tx) => {
            let txType = tx.type
            if (exportTypes.includes(txType)) return true
            return false
        })
    }

    get txsStake(): ITransactionData[] {
        let txs: ITransactionData[] = this.allTxs
        let stakeTypes: TransactionType[] = ['add_validator', 'add_delegator']

        return txs.filter((tx) => {
            let txType = tx.type
            if (stakeTypes.includes(txType)) return true
            return false
        })
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.activity_page {
    display: grid;
    grid-template-rows: max-content 1fr;
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

.tx_table {
    height: 100%;
    //overflow: auto;
    //overflow: scroll;
    padding-right: 20px;
    margin-right: 20px;
    border-right: 1px solid var(--bg-light);
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
    padding-top: 30px;
    height: 100%;
    overflow: auto;
    display: grid;
    grid-template-columns: 1fr 240px;
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
}

@include main.medium-device {
    .cols {
        grid-template-columns: 1fr 160px;
    }
}
</style>
