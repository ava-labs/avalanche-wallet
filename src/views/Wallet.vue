<template>
    <div class="wallet_view">
        <sidebar class="wallet_sidebar"></sidebar>
        <div class="wallet_main">
            <top-info class="wallet_top"></top-info>
            <transition name="page_fade" mode="out-in">
                <router-view id="wallet_router"></router-view>
            </transition>
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

    .page_fade-enter-active, .page_fade-leave-active {
        transition: all .2s;
    }
    .page_fade-enter, .page_fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
        transform: translateX(30px);
    }

</style>

<style lang="scss">

</style>
