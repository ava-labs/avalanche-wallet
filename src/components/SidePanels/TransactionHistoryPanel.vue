<template>
    <div class="tx_history_panel">
        <div class="header">
            <h2>Transactions</h2>
            <button>See All</button>
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
            <p class="warn">This list might be incomplete.</p>
        </div>
    </div>
</template>
<script>
    import TxHistoryRow from "@/components/SidePanels/TxHistoryRow";
    export default {
        components: {
            TxHistoryRow
        },
        computed: {
            isExplorer(){
                if(this.$store.state.Network.selectedNetwork.explorerUrl){
                    return true;
                }
                return false
            },
            isEmpty(){
                if(this.transactions.length === 0){
                    return true;
                }
                return false;
            },
            isUpdating(){
                return this.$store.state.History.isUpdating;
            },
            transactions(){
                let res =  this.$store.state.History.transactions;
                return res;
            }
        }
    }
</script>
<style scoped lang="scss">
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

        button{
            background-color: #2960CD;
            color: #fff;
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
</style>
