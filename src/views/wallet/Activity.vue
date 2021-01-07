<template>
    <div>
        yo
        <h1>Activity</h1>
        {{ txs.length }}
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'

@Component
export default class Activity extends Vue {
    activated() {
        // this.updateHistory()
    }

    mounted() {
        this.updateHistory()
    }

    updateHistory() {
        this.$store.dispatch('History/updateAllTransactionHistory')
    }

    get txs(): ITransactionData[] {
        return this.$store.state.History.allTransactions
    }
}
</script>
<style scoped lang="scss"></style>
