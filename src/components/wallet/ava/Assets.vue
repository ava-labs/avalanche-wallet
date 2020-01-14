<template>
    <div>
<!--            <h3>Assets</h3>-->
            <table>
                <thead>
                <tr>
                    <th>Asset</th>
                    <th>Balance</th>
                    <th>USD Total</th>
                    <th>BTC Total</th>
                    <th class="buts"></th>
                </tr>
                </thead>
                <tbody>
                    <tr v-for="asset in assets" :key="asset.key">
                        <td>{{asset.key}} {{asset.title}}</td>
                        <td>{{asset.balance}}</td>
                        <td>{{(asset.balance * asset.usd_price).toFixed(4)}}</td>
                        <td>{{(asset.balance * asset.btc_price).toFixed(4)}}</td>
                        <td class="buts">
                            <v-btn :to="'/wallet/transfer?asset='+asset.key" color="transparent" depressed height="28">Send</v-btn>
                            <v-btn :to="'/wallet/transfer?asset='+asset.key" color="transparent" depressed height="28">Receive</v-btn>
<!--                            <button @click="openSendReceive">Send</button>-->
<!--                            <button @click="openSendReceive">Receive</button>-->
                        </td>
                    </tr>
                </tbody>
            </table>
    </div>
</template>
<script>
    export default {
        data(){
            return{
            }
        },
        computed: {
            assets(){
                return this.$store.state.assets;
            }
        },
        methods: {
            openSendReceive(){
                this.$store.dispatch('openModal', 'send_receive');
            }
        }
    }
</script>
<style scoped>
    table{
        /*width: 100%;*/
        min-width: 50%;
        background-color: #303030;
        color: #d2d2d2;
        border-collapse: collapse;
    }

    table th{
        padding: 5px 20px;
        text-align: left;
    }

    table thead{
        border-bottom: 1px solid #909090;
    }

    table tbody td{
        padding: 20px 20px;
        text-align: left;
        font-size: 14px;
        border-bottom: 1px solid #3a3a3a;

    }

    td button{
        outline: none;
        border: 1px solid #a0a0a0;
        color: #a0a0a0;
        margin: 4px;
        padding: 2px 8px;
        border-radius: 4px;
    }
    td button:hover{
        border-color: #fff;
        color: #fff;
    }

    .buts a{
        color: #ddd;
        border: 1px solid #a0a0a0 !important;
        margin: 4px;
        font-size: 11px;
        background-color: transparent;
    }

    @media only screen and (max-width: 600px) {
        table th {
            font-size: 12px;
            text-align: center;
        }
        table tbody td {
            font-size: 12px;
            padding: 8px 0px;
            text-align: center;
        }


        th.buts,td.buts{
            padding: 0;
            display: none;
            /*display: block;*/
        }
    }
</style>