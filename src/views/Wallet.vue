<template>
    <div class="wallet_view">
        <sidebar class="wallet_sidebar"></sidebar>
        <div class="wallet_main">
            <top-info class="wallet_top"></top-info>
            <router-view id="wallet_router"></router-view>
        </div>
    </div>
</template>
<script>
    import TopInfo from '@/components/wallet/TopInfo';
    import Sidebar from '@/components/wallet/Sidebar';

    export default {
        components:{
            TopInfo,
            Sidebar,
        },
    }
</script>
<style lang="scss" scoped>

    .wallet_view{
        display: grid;
        grid-template-columns: max-content 1fr;
        grid-gap: 90px;
    }

    .wallet_main{
        display: grid;
        grid-template-rows: max-content 1fr;
        grid-gap: 50px;

    }

</style>

<style lang="scss">

</style>
