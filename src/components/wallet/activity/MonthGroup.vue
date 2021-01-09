<template>
    <div class="month_group">
        <p class="date_label">{{ yearLabel }} {{ monthLabel }}</p>
        <div>
            <DayGroup v-for="days in dayGroups" :transactions="days" :key="days[0].txID"></DayGroup>
        </div>
        <!--        <TxRow v-for="tx in transactions" :key="tx.id" :transaction="tx"></TxRow>-->
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'
import moment from 'moment'

import TxRow from '@/components/wallet/activity/TxRow.vue'
import DayGroup from '@/components/wallet/activity/DayGroup.vue'

@Component({
    components: {
        TxRow,
        DayGroup,
    },
})
export default class MonthGroup extends Vue {
    @Prop() transactions!: ITransactionData[]

    get mom(): any {
        let tx = this.transactions[0]
        let mom = moment(tx.timestamp)
        return mom
    }
    get monthLabel(): string {
        let month = this.mom.format('MMMM')
        return month
    }

    get dayGroups(): any {
        let res: any = {}
        let txs = this.transactions
        let dayIdx = 0

        // From most recent to oldest
        for (var i = 0; i < txs.length; i++) {
            let tx = txs[i]
            let mom = moment(tx.timestamp)
            let day = mom.format('D')
            let key = `${dayIdx}_${day}`
            if (res[key]) {
                res[key].push(tx)
            } else {
                dayIdx++
                key = `${dayIdx}_${day}`
                res[key] = [tx]
            }
        }
        return res
    }

    get yearLabel(): string {
        return this.mom.format('Y')
    }
}
</script>
<style scoped lang="scss">
@use "../../../main";
.month_group {
    position: relative;
    display: grid;
    grid-template-columns: max-content 1fr;
    grid-gap: 14px;
}
.date_label {
    line-height: 24px;
    position: sticky;
    top: 0px;
    height: max-content;
    font-size: 24px;
    width: max-content;
    z-index: 2;
    //background-color: var(--bg);
}
</style>
