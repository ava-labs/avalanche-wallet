<template>
    <div>
<!--            <h3>Assets</h3>-->
            <table>
                <thead>
                <tr>
                    <th>Asset</th>
                    <th>Balance</th>
                    <th>USD</th>
                    <th @click="toggleCryptoView" class="cryptoToggle">{{crypto_view}}</th>
                    <th class="buts"></th>
                </tr>
                </thead>
                <tbody>
                    <tr v-for="asset in assets" :key="asset.id">
                        <td><span class="asset_code">{{asset.code}}</span> - {{asset.title}}</td>
                        <td>{{asset.balance.toLocaleString()}}</td>
                        <td>{{(asset.balance * asset.usd_price).toFixed(2)}}</td>
                        <td>{{getCryptoVal(asset).toFixed(4)}}</td>
                        <td class="buts">
                            <v-btn :to="'/wallet/transfer?asset='+asset.code" color="transparent" depressed height="28">Send</v-btn>
                            <v-btn :to="'/wallet/transfer?asset='+asset.code" color="transparent" depressed height="28">Receive</v-btn>
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
                crypto_view: 'AVA'
            }
        },
        computed: {
            assets(){
                let balance = this.$store.getters.balance;

                let array = [];

                for(var id in balance){
                    array.push(balance[id]);
                }

                array.sort((a,b) => {
                    let t1 = a.title;
                    let t2 = b.title;
                    if(t1<t2){
                        return -1
                    }else if(t1>t2){
                        return 1;
                    }else{
                        return 0;
                    }
                });
                return array;
            }
        },
        methods: {
            toggleCryptoView(){
                if(this.crypto_view==='BTC'){
                    this.crypto_view = 'AVA'
                }else{
                    this.crypto_view = 'BTC'
                }
            },
            getCryptoVal(asset){
                let crypt_val = asset.ava_price;
                if(this.crypto_view==='BTC') crypt_val=asset.btc_price;
                return (asset.balance * crypt_val);
            },
            openSendReceive(){
                this.$store.dispatch('openModal', 'send_receive');
            }
        }
    }
</script>
<style scoped>
    table{
        width: 100%;
        /*min-width: 50%;*/
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



    .asset_code{
        font-weight: bold;
    }

    .buts a{
        color: #ddd;
        border: 1px solid #a0a0a0 !important;
        margin: 4px;
        font-size: 11px;
        background-color: transparent;
    }

    .cryptoToggle{
        cursor: pointer;
        text-decoration: underline;
    }

    @media only screen and (max-width: 1400px) {
        table tbody td {
            padding: 8px 10px;
            max-width: 200px;
            word-break: break-word;
        }
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