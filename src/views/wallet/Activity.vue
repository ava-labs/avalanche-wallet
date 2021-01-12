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
                        <button @click="prevPage">Before</button>
                        <button @click="nextPage">Next</button>
                    </div>
                    <p>Page {{ pageNow + 1 }} of {{ pageAmount + 1 }}</p>
                </div>
                <div class="tx_list" v-show="showList">
                    <MonthGroup
                        class="month_group"
                        v-for="month in monthGroups"
                        :key="month[0].timestamp"
                        :transactions="month"
                    ></MonthGroup>
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
import { ITransactionData, TransactionType } from '@/store/modules/history/types'

import TxRow from '@/components/wallet/activity/TxRow.vue'
import MonthGroup from '@/components/wallet/activity/MonthGroup.vue'
import RadioButtons from '@/components/misc/RadioButtons.vue'
import Spinner from '@/components/misc/Spinner.vue'

type FilterModeType = 'all' | 'transfer' | 'export_import' | 'stake'
type ModeKeyType = 'all' | 'transfer' | 'swap' | 'stake'

const PAGE_LIMIT = 100

@Component({
    components: {
        Spinner,
        TxRow,
        MonthGroup,
        RadioButtons,
    },
})
export default class Activity extends Vue {
    mode: ModeKeyType = 'all'
    modes = ['All', 'Transfer', 'Export & Import', 'Validation & Delegation']
    modeKey: ModeKeyType[] = ['all', 'transfer', 'swap', 'stake']
    isLoading = false
    pageNow = 0

    get showList(): boolean {
        if (this.isUpdatingAll || this.isLoading) return false
        return true
    }

    get isUpdatingAll(): boolean {
        return this.$store.state.History.isUpdatingAll
    }

    mounted() {
        this.updateHistory()
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
        switch (this.mode) {
            case 'transfer':
                return this.txsTransfer
                break
            case 'swap':
                return this.txsSwap
                break
            case 'stake':
                return this.txsStake
                break
            default:
                return this.allTxs
                break
        }
    }

    get pageAmount(): number {
        return Math.floor(this.txs.length / PAGE_LIMIT)
    }

    prevPage() {
        if (this.pageNow > 0) {
            this.pageNow--
        }
    }
    nextPage() {
        if (this.pageNow < this.pageAmount) {
            this.pageNow++
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
    overflow: scroll;
    padding-right: 20px;
    margin-right: 20px;
    border-right: 1px solid var(--bg-light);
}

.tx_list {
    //max-height: 480px;
    //overflow: scroll;
    height: 100px;
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

@include main.medium-device {
    .cols {
        grid-template-columns: 1fr 160px;
    }
}
</style>
