<template>
    <div class="ava_view">
        <transfer></transfer>
<!--        <div>-->
<!--            <div>-->
<!--                <h4>Transfer</h4>-->

<!--            </div>-->
<!--            <div>-->

<!--            </div>-->
<!--        </div>-->
        <assets class="assets floater"></assets>
    </div>
</template>
<script>
    // import TopInfo from '@/components/wallet/ava/TopInfo';
    import Assets from "@/components/wallet/ava/Assets";
    import Transfer from "@/components/wallet/ava/Transfer";
    // import SendReceive from '../../components/wallet/ava/SendReceive';

    export default {
        data(){
            return {
            }
        },
        components: {
            Assets,
            Transfer
            // TopInfo,
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

            // this.autoUpdateId = setInterval(()=>{
            //     parent.$store.dispatch('updateUTXOs');
            // }, 200);
        },
        destroyed() {
        }
    }
</script>
<style scoped>
    .ava_view{
        display: grid;
        grid-template-columns: 2fr 1fr;
        row-gap: 15px;
        grid-gap: 15px;
    }

    .ava_view > div{
        background-color: #505050;
        border-radius: 6px;
        /*color: #222;*/
    }
    .floaters > div{

    }

    .assets{
        overflow: hidden;
        background-color: #424242;
    }

    @media only screen and (max-width: 600px) {
        .ava_view{
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
        }
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
    }
</style>