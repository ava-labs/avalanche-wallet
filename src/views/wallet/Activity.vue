<template>
    <div class="activity_page">
        <div class="header">
            <h1>Activity</h1>
            <p>{{ txs.length }} transactions found</p>
            <button @click="updateHistory"><fa icon="sync"></fa></button>
        </div>
        <div class="cols">
            <div class="tx_table">
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
                <div v-if="!showList" class="empty">
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
    modes = ['All', 'Transfer', 'Export/Import', 'Validation/Delegation']
    modeKey: ModeKeyType[] = ['all', 'transfer', 'swap', 'stake']
    isLoading = false

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

    get txs(): ITransactionData[] {
        // return this.$store.state.History.allTransactions.slice(0, 100)
        let txs: ITransactionData[] = this.$store.state.History.allTransactions
        let filter = this.mode

        let transferTypes: TransactionType[] = ['base', 'create_asset', 'operation']
        let exportTypes: TransactionType[] = ['import', 'export', 'pvm_import', 'pvm_export']
        let stakeTypes: TransactionType[] = ['add_validator', 'add_delegator']

        let filt = txs.filter((tx) => {
            let txType = tx.type
            if (filter === 'all') {
                return true
            } else if (filter === 'transfer') {
                if (transferTypes.includes(txType)) return true
            } else if (filter === 'swap') {
                if (exportTypes.includes(txType)) return true
            } else if (filter === 'stake') {
                if (stakeTypes.includes(txType)) return true
            }

            return false
        })

        return filt
    }
}
</script>
<style scoped lang="scss">
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
    grid-template-columns: 2fr 240px;
}

.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px 12px;
}

.spinner {
    width: 20px;
    height: 20px;
    color: #1d82bb;
}
</style>
