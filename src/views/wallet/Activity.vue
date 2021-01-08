<template>
    <div>
        <div class="header">
            <h1>Activity</h1>
            <p>{{ txs.length }} transactions found</p>
            <button @click="updateHistory"><fa icon="sync"></fa></button>
        </div>

        <div>
            <label>Filter by type</label>
            <v-chip-group v-model="mode">
                <v-chip value="all">All</v-chip>
                <v-chip value="transfer">Transfer</v-chip>
                <v-chip value="export_import">Export/Import</v-chip>
                <v-chip value="stake">Validation/Delegation</v-chip>
            </v-chip-group>
        </div>
        <div>
            <div class="table_headers">
                <p>Date</p>
                <p>Action</p>
            </div>
            <div class="tx_list">
                <MonthGroup
                    class="month_group"
                    v-for="month in monthGroups"
                    :key="month[0].timestamp"
                    :transactions="month"
                ></MonthGroup>
                <!--                <div class="month_group" v-for="month in monthGroups" :key="month[0].timestamp">-->
                <!--                    <p class="month_label">{{ month[0].timestamp }}</p>-->
                <!--                    <TxRow v-for="tx in month" :key="tx.id" :transaction="tx"></TxRow>-->
                <!--                </div>-->
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'

import TxRow from '@/components/wallet/activity/TxRow.vue'
import MonthGroup from '@/components/wallet/activity/MonthGroup.vue'

type FilterModeType = 'all' | 'transfer' | 'export_import' | 'stake'
@Component({
    components: {
        TxRow,
        MonthGroup,
    },
})
export default class Activity extends Vue {
    mode: FilterModeType = 'all'
    activated() {
        // this.updateHistory()
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
        return this.$store.state.History.allTransactions
    }
}
</script>
<style scoped lang="scss">
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
.tx_list {
    max-height: 480px;
    overflow: scroll;
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
}
.month_label {
    position: sticky;
    top: 0px;
}
</style>
