<template>
    <div class="wallet_view">
<!--        <div id="wallet_view">-->
            <sidebar class="wallet_sidebar"></sidebar>
            <router-view id="wallet_router"></router-view>
<!--        </div>-->

    </div>
</template>
<script>
    import Sidebar from '../components/wallet/Sidebar'
    export default {
        components:{
            Sidebar
        }
    }
</script>
<style scoped>
    .wallet_sidebar{
        position: fixed;
        left: 0;
        height: 100%;
        background-color: #f9f9f9;
        /*box-shadow: 2px 2px 10px rgba(0,0,0,0.2);*/
        border-right: 1px solid #eaeaea;
        width: 320px;
    }

    .wallet_view{
        padding-left: 320px;
    }

    #wallet_router{

    }
</style>