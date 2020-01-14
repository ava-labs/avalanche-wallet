<template>
    <div class="wallet_view">
<!--        <div id="wallet_view">-->
        <send-receive></send-receive>
        <sidebar class="wallet_sidebar"></sidebar>
        <router-view id="wallet_router"></router-view>
<!--        </div>-->

    </div>
</template>
<script>
    import Sidebar from '../components/wallet/Sidebar'
    import SendReceive from '../components/modals/SendReceive'

    export default {
        components:{
            Sidebar,
            SendReceive
        },
    }
</script>
<style scoped>
    .wallet_sidebar{
        position: fixed;
        left: 0;
        height: 100%;
        background-color: #3a3a3a;
        /*box-shadow: 2px 2px 10px rgba(0,0,0,0.2);*/
        border-right: 1px solid #202020;
        width: 320px;
    }

    .wallet_view{
        padding-left: 320px;
    }

    #wallet_router{

    }
</style>