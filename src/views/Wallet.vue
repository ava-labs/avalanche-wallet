<template>
    <div class="wallet_view">
        <sidebar class="wallet_sidebar"></sidebar>
        <div class="wallet_main">
            <v-container>
                <top-info></top-info>
                <router-view id="wallet_router"></router-view>
            </v-container>
        </div>
    </div>
</template>
<script>
    import TopInfo from '@/components/wallet/TopInfo';

    import Sidebar from '../components/wallet/Sidebar'
    // import SendReceive from '../components/modals/SendReceive'

    export default {
        components:{
            Sidebar,
            TopInfo
            // SendReceive
        },
    }
</script>
<style scoped>
    .wallet_sidebar{
        /*position: fixed;*/
        left: 0;
        /*height: 100%;*/
        height: min-content;
        background-color: #3a3a3a;
        /*box-shadow: 2px 2px 10px rgba(0,0,0,0.2);*/
        /*border-right: 1px solid #202020;*/
        width: 240px;
        margin: 30px;
        flex-basis: 240px;
        flex-shrink: 0;
        border: 1px solid #39403d;
        border-bottom: none;
    }

    .wallet_main{
        flex-grow: 1;
        margin: 30px;
    }
    .wallet_view{
        display: flex;
        flex-grow: 1;
        /*display: grid;*/
        /*grid-template-columns: min-content auto;*/
    }

    #wallet_router{
        margin-top: 15px;
        /*margin: 30px;*/
        /*flex-grow: 1;*/
    }


    @media only screen and (max-width: 600px) {
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

        .wallet_main{
            margin: unset;
            padding-top: 70px;
        }
    }
</style>