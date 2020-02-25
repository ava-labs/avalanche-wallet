<template>
    <div class="ava_view">
        <div class="tabs">

<!--            <a>Send</a>-->
<!--            <a>Manage Keys</a>-->
<!--            <a>Backup Wallet</a>-->
        </div>
<!--        <transfer></transfer>-->
<!--        <assets class="assets floater"></assets>-->
    </div>
</template>
<script>
    // import Assets from "@/components/wallet/ava/Assets";
    import Transfer from "@/components/wallet/Transfer";

    export default {
        data(){
            return {
            }
        },
        components: {
            // Assets,
            Transfer
        },
        computed: {

        },
        methods: {
        },
        mounted(){
            let parent = this;
            parent.$store.dispatch('Assets/updateUTXOs');
        },
        destroyed() {
        }
    }
</script>
<style lang="scss" scoped>


    .ava_view{
        /*display: grid;*/
        /*grid-template-columns: 2fr 1fr;*/
        /*row-gap: 15px;*/
        /*grid-gap: 15px;*/
    }

    .ava_view > div{
        /*background-color: #505050;*/
        /*border-radius: 6px;*/
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
        height: max-content;
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