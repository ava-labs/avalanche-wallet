<template>
    <div class="ava_view">
        <div class="wallet_info">
            <h4>Wallet value</h4>
            <div class="values">
                <p>
                    <span>USD {{Math.floor(total_usd)}}.</span>{{ Math.round((total_usd%1)*100000) }}
                </p>
                <p>
                    <span>BTC {{Math.floor(total_btc)}}.</span>{{ Math.round((total_btc%1)*100000) }}
                </p>
            </div>
        </div>
        <assets class="assets floater"></assets>

        <!--        <div class="floaters">-->
<!--            <send-receive class="send_receive"></send-receive>-->
<!--        </div>-->
    </div>
</template>
<script>
    import Assets from "@/components/wallet/ava/Assets";
    // import SendReceive from '../../components/wallet/ava/SendReceive';

    export default {
        components: {
            Assets,
            // SendReceive
        },
        computed: {
            total_usd(){
                return this.$store.getters.wallet_value_usd;
            },
            total_btc(){
                return this.$store.getters.wallet_value_btc;
            }

        }
    }
</script>
<style scoped>
    .ava_view{
        padding: 50px;
    }

    /*.floaters{*/
    /*    display: flex;*/
    /*}*/



    .floaters > div{

    }

    .assets{
        /*flex-grow: 1;*/
        overflow: hidden;
        /*background-color: #fff;*/
    }

    /*.send_receive{*/
    /*    flex-basis: 320px;*/
    /*    display: flex;*/
    /*    flex-direction: column;*/
    /*}*/
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
        color: #faa;
    }

    .wallet_info h4{
        text-align: left;
    }
    .values{
        display: flex;
    }

    .values p{
        margin-right: 40px;
    }

    .values p span{
        font-size: 45px;
    }
</style>