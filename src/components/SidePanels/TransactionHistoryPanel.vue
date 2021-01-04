<template>
    <div class="tx_history_panel">
        <div class="header">
            <h2>Transactions</h2>
            <Spinner v-if="isUpdating" class="spinner"></Spinner>
            <!--            <a :href="explorerUrl" target="_blank" class="button_primary">See All</a>-->
        </div>
        <div class="empty" v-if="!isExplorer">
            <h4>{{ $t('transactions.error_api') }}</h4>
            <p>{{ $t('transactions.error_api_desc') }}</p>
        </div>
        <div class="empty" v-else-if="isEmpty && !isUpdating">
            <p>{{ $t('transactions.notx') }}</p>
        </div>
        <div v-else-if="isUpdating">
            <p class="empty">{{ $t('transactions.loading') }}</p>
        </div>
        <div class="list" v-else>
            <tx-history-row
                v-for="tx in transactions"
                :key="tx.id"
                :transaction="tx"
                class="tx_row"
            ></tx-history-row>
            <p class="warn">{{ $t('transactions.warn_loading') }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Spinner from '@/components/misc/Spinner.vue'
import TxHistoryRow from '@/components/SidePanels/TxHistoryRow.vue'
import { ITransactionData } from '@/store/modules/history/types'
import { AvaNetwork } from '@/js/AvaNetwork'
import { ITransaction } from '@/components/wallet/transfer/types'

@Component({
    components: {
        TxHistoryRow,
        Spinner,
    },
})
export default class TransactionHistoryPanel extends Vue {
    get isExplorer(): boolean {
        let network: AvaNetwork | null = this.$store.state.Network.selectedNetwork
        if (!network) return false
        if (network.explorerUrl) {
            return true
        }
        return false
    }

    get isEmpty(): boolean {
        if (this.transactions.length === 0) {
            return true
        }
        return false
    }
    get isUpdating(): boolean {
        return this.$store.state.History.isUpdating
    }
    get transactions(): ITransactionData[] {
        let res: ITransactionData[] = this.$store.state.History.transactions

        if (!res) return []

        let seenId: string[] = []
        let r: ITransactionData[] = res.filter((tx) => {
            if (seenId.includes(tx.id)) {
                return false
            }
            seenId.push(tx.id)
            return true
        })
        // A simple filter to ignore duplicate transactions (can happen if you send to self)
        return r
    }
    get explorerUrl(): string {
        let addr = this.$store.state.address.split('-')[1]
        return `https://explorer.avax.network/address/${addr}`
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.tx_history_panel {
    display: grid;
    grid-template-rows: max-content 1fr;
    overflow: auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--bg-light);
    padding: 8px 16px;

    h2 {
        font-weight: normal;
    }

    a {
        /*background-color: var(--primary-color);*/
        /*color: #fff !important;*/
        padding: 4px 18px;
        font-size: 12px;
    }
}

.spinner {
    align-self: center;
    margin-left: 10px;
}
.list {
    overflow: scroll;
    padding: 8px 16px;
    padding-bottom: 20px;
}

.empty {
    font-size: 12px;
    text-align: center;
    padding: 30px;
}

.tx_row {
    border-bottom: 1px solid var(--bg-light);

    &:last-of-type {
        border: none;
    }
}
.warn {
    background-color: var(--bg-light);
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    padding: 15px;
}

@include main.medium-device {
    .header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
