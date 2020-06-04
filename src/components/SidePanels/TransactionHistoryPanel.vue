<template>
    <div class="tx_history_panel">
        <div class="header">
            <h2>Transactions</h2>
            <a :href="explorerUrl" target="_blank">See All</a>
        </div>
        <div class="empty" v-if="!isExplorer">
            <h4>Explorer API Not Found</h4>
            <p>You must provide an AVA Explorer API for this network to view transaction history.</p>
        </div>
        <div class="empty" v-else-if="isEmpty && !isUpdating">
            <p>No transactions found for this address on the explorer.</p>
        </div>
        <div v-else-if="isUpdating">
            <p class="empty">Loading transaction history..</p>
        </div>
        <div class="list" v-else>
            <tx-history-row v-for="tx in transactions" :key="tx.id" :transaction="tx">
            </tx-history-row>
            <p class="warn">This list might be incomplete and out of order.</p>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import TxHistoryRow from "@/components/SidePanels/TxHistoryRow.vue";
    import {ITransactionData} from "@/store/modules/history/types";
    import {AvaNetwork} from "@/js/AvaNetwork";

    @Component({
        components: {
            TxHistoryRow
        }
    })
    export default class TransactionHistoryPanel extends Vue{

        get isExplorer(): boolean{
            let network: AvaNetwork|null = this.$store.state.Network.selectedNetwork;
            if(!network) return false;
            if(network.explorerUrl){
                return true;
            }
            return false;
        }

        get isEmpty(): boolean{
            if(this.transactions.length === 0){
                return true;
            }
            return false;
        }
        get isUpdating(): boolean{
            return this.$store.state.History.isUpdating;
        }
        get transactions(): ITransactionData[]{
            let res =  this.$store.state.History.transactions;
            return res;
        }
        get explorerUrl(): string{
            let addr = this.$store.state.selectedAddress.split('-')[1];
            return `https://explorer.ava.network/address/${addr}`;
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    .tx_history_panel{
        display: grid;
        grid-template-rows: max-content 1fr;
        overflow: auto;
    }

    .header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #EAEDF4;
        padding: 8px 16px;

        h2{
            font-weight: normal;
        }

        a{
            background-color: #2960CD;
            color: #fff !important;
            padding: 4px 18px;
            font-size: 12px;
        }
    }
    .list{
        overflow: scroll;
        padding: 8px 16px;
    }

    .empty{
        font-size: 12px;
        text-align: center;
        padding: 30px;
    }

    .warn{
        background-color: #EAEDF4;
        text-align: center;
        font-size: 12px;
        font-weight: bold;
        padding: 15px;
    }


    @include main.medium-device {
        .header{
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
