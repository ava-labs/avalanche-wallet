<template>
    <div class="ava_view">
        <div class="wallet_info">
            <h4>Wallet value</h4>
            <div class="values">
                <p>
                    <span class="currency">USD</span>
                    <span>{{Math.floor(total_usd).toLocaleString()}}.</span>{{ Math.round((total_usd%1)*100) }}
                </p>
                <p>
                    <span class="currency">BTC</span>
                    <span>{{Math.floor(total_btc).toLocaleString()}}.</span>{{ Math.round((total_btc%1)*100000) }}
                </p>
                <p>
                    <span class="currency">AVA</span>
                    <span>{{Math.floor(total_ava).toLocaleString()}}.</span>{{ Math.round((total_ava%1)*100000) }}
                </p>
            </div>
        </div>
<!--        <div class="create_asset">-->
<!--            <h4>Create new asset</h4>-->
<!--            <input type="number" value="1000">-->
<!--            <v-text-field type="number" persistent-hint-->
<!--                          hint="How many of this asset should exist?"-->
<!--                          label="Amount"-->
<!--                          color="#fff"-->
<!--            ></v-text-field>-->
<!--            <v-btn @click="createAsset" depressed height="24">Create Asset</v-btn>-->
<!--        </div>-->
        <assets class="assets floater"></assets>
    </div>
</template>
<script>
    import Assets from "@/components/wallet/ava/Assets";
    // import SendReceive from '../../components/wallet/ava/SendReceive';

    export default {
        data(){
            return {
                interval_id: null,
            }
        },
        components: {
            Assets,
            // SendReceive
        },
        computed: {
            total_usd(){
                let balances = this.$store.getters.balance;

                let res = 0;
                for(var i in balances){
                    let balance = balances[i];
                    res += balance.balance * balance.usd_price;
                }
                return res;
            },
            total_btc(){
                let balances = this.$store.getters.balance;

                let res = 0;
                for(var i in balances){
                    let balance = balances[i];
                    res += balance.balance * balance.btc_price;
                }
                return res;
            },
            total_ava(){
                let balances = this.$store.getters.balance;

                let res = 0;
                for(var i in balances){
                    let balance = balances[i];
                    res += balance.balance * balance.ava_price;
                }
                return res;
            }
        },
        methods: {
            createAsset(){
                // this.$store.dispatch('createAsset', 1000);
            }
        },
        mounted(){
            let parent = this;
            parent.$store.dispatch('updateUTXOs');
            this.interval_id = setInterval(() => {
                parent.$store.dispatch('updateUTXOs');
            }, 5000);
        },
        destroyed() {
            console.log('DESTRROYY');
            clearInterval(this.interval_id);
        }
    }
</script>
<style scoped>
    .ava_view{
    }

    .floaters > div{

    }

    .assets{
        overflow: hidden;
    }

</style>
<style>
    .floater{
        min-height: 20px;
        border-radius: 2px;
        /*margin: 20px;*/
        height: max-content;
        /*box-shadow: 9px 6px 10px rgba(0,0,0,0.2);*/
        /*background-color: #fff;*/
        overflow: hidden;
    }

    .floater h3{
        font-size: 16px;
        padding: 12px;
        background-color: #cbceda;
    }

    .wallet_info{
        color: #42b983;
    }

    .wallet_info h4{
        text-align: left;
    }
    .values{
        display: flex;
        /*margin-top: 20px;*/
    }

    .values p{
        margin-right: 40px;
        margin-bottom: 0;
    }

    .values p span{
        font-size: 45px;
    }

    .values .currency{
        text-align: left;
        color: #ddd;
        display: block;
        font-size: 16px;
    }

    .create_asset{
        text-align: left;
        width: max-content;
        color: #d2d2d2;
        padding: 12px;
        display: flex;
        flex-direction: column;
        margin: 12px 0px;
        background-color: #3a3a3a;

    }

    @media only screen and (max-width: 1400px) {
        .values p span {
            font-size: 22px;
        }
    }

    @media only screen and (max-width: 600px) {
        .wallet_info{
            padding: 15px 0px;
        }
        .wallet_info h4 {
            text-align: center;
        }
        .values{
            display: block;
        }
        .values p {
            margin: 5px 0px !important;
            display: block;
            font-size: 12px;
        }
        .values p span {
            font-size: 22px;
        }
        .values .currency{
            text-align: center;
            font-size: 12px;
        }

        .floater{
            margin: 10px;
        }
    }
</style>