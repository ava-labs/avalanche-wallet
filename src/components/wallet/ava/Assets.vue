<template>
    <div>
<!--            <h3>Assets</h3>-->
        <div class="tabletop">
            <h4>Assets</h4>
            <img v-if="isUpdateBalance" src="/gif/loading_2.gif">
            <button v-else @click="updateAssets"><fa icon="sync"></fa></button>
        </div>
        <div v-if="assets.length === 0" class="noassets">
            <p>You do not have any assets.</p>
        </div>
        <table v-else>
            <thead>
            <tr>
                <th>Asset</th>
                <th>Balance</th>
<!--                    <th>USD</th>-->
<!--                    <th @click="toggleCryptoView" class="cryptoToggle">{{crypto_view}}</th>-->
<!--                    <th class="buts"></th>-->
            </tr>
            </thead>
            <tbody>
                <tr v-for="asset in assets" :key="asset.id">
                    <td><span class="asset_code">{{asset.symbol}}</span> - {{asset.name}}</td>
                    <td>{{asset.balance.toLocaleString()}}</td>
<!--                        <td>{{(asset.balance * asset.usd_price).toFixed(2)}}</td>-->
<!--                        <td>{{getCryptoVal(asset).toFixed(4)}}</td>-->
<!--                        <td class="buts">-->
<!--                            <v-btn :to="'/wallet/transfer?asset='+asset.code" color="transparent" depressed height="28">Send</v-btn>-->
<!--                            <v-btn :to="'/wallet/transfer?asset='+asset.code" color="transparent" depressed height="28">Receive</v-btn>-->
<!--                        </td>-->
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
                    let t1 = a.name;
                    let t2 = b.name;
                    if(t1<t2){
                        return -1
                    }else if(t1>t2){
                        return 1;
                    }else{
                        return 0;
                    }
                });
                return array;
            },
            isUpdateBalance(){
                return this.$store.state.isUpdateBalance;
            },
        },
        methods: {
            updateAssets(){
                this.$store.dispatch('updateUTXOs');
            },
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
        },

    }
</script>
<style scoped>
    .tabletop{
        text-align: left;
        padding: 8px 15px;
        display: flex;
        background-color: #6ca7a7;
        color: #fff;
    }

    .tabletop img{
        height: 24px;
        width: 24px;
        object-fit: contain;
    }
    .tabletop h4{
        flex-grow: 1;
    }

    .noassets{
        padding: 15px;
        color: #ddd;
    }
    .noassets p{
        margin: 0;
    }

    table{
        width: 100%;
        /*min-width: 50%;*/
        /*background-color: #303030;*/
        color: #d2d2d2;
        border-collapse: collapse;
    }

    table th{
        padding: 5px 20px;
        text-align: left;
    }

    table thead{
        display: none;
        border-bottom: 1px solid #909090;
    }

    table tbody td{
        /*padding: 20px 20px;*/
        padding: 6px;
        text-align: left;
        font-size: 13px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        word-break: break-all;
        max-width: 200px;

        /*border-bottom: 1px solid #3a3a3a;*/

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


    @media only screen and (max-width: 600px) {
        table th {
            font-size: 12px;
            text-align: center;
        }
        /*table tbody td {*/
        /*    font-size: 12px;*/
        /*    padding: 8px 0px;*/
        /*    text-align: center;*/
        /*}*/


        th.buts,td.buts{
            padding: 0;
            display: none;
            /*display: block;*/
        }
    }
</style>