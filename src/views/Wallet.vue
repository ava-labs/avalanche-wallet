<template>
    <div class="wallet_view">
<!--        <sidebar class="wallet_sidebar"></sidebar>-->
        <div class="wallet_main">
            <v-container class="wallet_container">
                <top-info class="wallet_top"></top-info>
                <div class="wallet_cols">
                    <div id="router_col">
                        <tabs></tabs>
                        <router-view id="wallet_router"></router-view>
                    </div>
                    <assets class="assets_card"></assets>
                </div>
            </v-container>
        </div>
    </div>
</template>
<script>
    import TopInfo from '@/components/wallet/TopInfo';
    import Assets from "../components/wallet/Assets";
    import Tabs from '@/components/wallet/Tabs';

    export default {
        components:{
            TopInfo,
            Assets,
            Tabs
        },
    }
</script>
<style lang="scss" scoped>

    #router_col{
        background-color: #fff;
        color: #5a5a5a;
        border-radius: 5px;
    }

    .wallet_main{
        flex-grow: 1;
        margin: 30px;
    }
    .wallet_view{
        display: flex;
        flex-grow: 1;
    }

    #wallet_router{
        /*margin: 30px;*/
        /*flex-grow: 1;*/
    }

    .wallet_cols{
        margin-top: 15px;
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 20px;
    }

    .assets_card{
        border-radius: 5px;
        overflow: hidden;
    }


    @media only screen and (max-width: 600px) {
        .wallet_container{
            padding: 0;
        }

        .wallet_top{
            margin: 10px;
        }
        .wallet_view {
            display: block;
        }

        .wallet_sidebar{
            margin: unset;
            position: fixed;
            display: flex;
            width: 100%;
            height: 70px;
            z-index: 2;
            background-color: #232323;
            border: none;
        }

        .wallet_cols{
            grid-template-columns: 1fr;
            /*grid-template-rows: 1fr 1fr;*/
        }

        .wallet_main{
            margin: unset;
            /*padding-top: 70px;*/
        }

        .assets_card {
            /*margin: 10px;*/
            border-radius: 0;
            max-height: 60vh;
        }
    }
</style>

<style lang="scss">
    $padLeft: 30px;

    #router_col h2{
        border-bottom: 1px solid #f2f2f2;
        padding: 15px $padLeft;
        color: #404040;
    }

    #router_col .card_body{
        color: #222;
        padding: 0px $padLeft;
        padding-bottom: 30px;
    }
</style>