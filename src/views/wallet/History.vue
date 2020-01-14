<template>
    <div>
        <div class="history_main">
            <div class="history_col" type="outbound">
                <h4><fa icon="sign-out-alt"></fa><br>Outbound</h4>
                <table>
                    <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Amount</th>
                        <th>To</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in items" :key="item.id">
                        <td>{{item.asset}}</td>
                        <td>{{item.amount}}</td>
                        <td>{{item.to}}</td>
                        <td>{{item.status}}</td>
                        <td>{{item.date.toDateString()}}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="history_col" type="inbound">
                <h4><fa style="transform: rotateZ(180deg)" icon="sign-in-alt"></fa><br>Inbound</h4>
                <table>
                    <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Amount</th>
                        <th>From</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in items" :key="item.id">
                        <td>{{item.asset}}</td>
                        <td>{{item.amount}}</td>
                        <td>{{item.to}}</td>
                        <td>{{item.status}}</td>
                        <td>{{item.date.toDateString()}}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>
<script>
    export default {
        computed: {
            items(){
                return this.$store.state.tx_history;
            }
        }
    }
</script>
<style scoped>
    .history_main{
        /*padding: 50px;*/
        display: grid;
        grid-template-columns: auto auto;
        color: #d2d2d2;
    }

    h4{
        font-size: 18px;
        /*text-align: left;*/
        margin-bottom: 15px;
    }

    .history_col{
        background-color: #353535;
        padding: 15px 0px;
        margin: 0px 15px;
        border-radius: 5px;
    }
    table{
        width: 100%;
        border-collapse: collapse;
    }

    table thead tr{
        border-bottom: 1px solid #a0a0a0;
    }

    .history_col[type='inbound'] table thead tr{
        border-color: #6ca771;
    }
    .history_col[type='outbound'] table thead tr{
        border-color: #d88383;
    }


    table tbody td{
        padding: 15px;
        border-bottom: 1px solid #353535;
    }


    @media only screen and (max-width: 600px) {
        .history_main{
            display: block;
        }

        h4{
            font-size: 12px;
        }

        th{
            font-size: 11px;
        }
        table tbody td{
            font-size: 11px;
            padding: 5px 0px;
            border-bottom: 1px solid #404040;
            word-break: break-all;
        }

        .history_col{
            margin: 10px;
            padding: 5px;
        }
    }
</style>