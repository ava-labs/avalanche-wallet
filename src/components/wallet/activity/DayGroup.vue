<template>
    <div class="day_group">
        <p class="date_label">{{ dayLabel }}</p>
        <div class="txs_col">
            <TxRow v-for="tx in transactions" :key="tx.id" :transaction="tx" class="tx"></TxRow>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'

import TxRow from '@/components/wallet/activity/TxRow.vue'
import moment from 'moment'

@Component({
    components: {
        TxRow,
    },
})
export default class DayGroup extends Vue {
    @Prop() transactions!: ITransactionData[]

    get mom(): any {
        let tx = this.transactions[0]
        let mom = moment(tx.timestamp)
        return mom
    }

    get dayLabel() {
        return this.mom.format('dddd Do')
    }
}
</script>
<style scoped lang="scss">
.day_group {
    display: grid;
    grid-template-columns: 1fr 3fr;
    margin-bottom: 14px;
    padding-bottom: 14px;
    //border-bottom: 1px solid var(--bg-light);
}

.txs_col {
    background-color: var(--bg-light);
    width: 100%;
    overflow: auto;
}
.date_label {
    position: sticky;
    top: 0px;
    height: max-content;
    font-size: 18px;
}

.tx {
    border-bottom: 1px solid var(--bg);

    &:last-of-type {
        border-bottom: none;
    }
}
</style>
