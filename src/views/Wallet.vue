<template>
    <div class="wallet_view">
<!--        <sidebar class="wallet_sidebar"></sidebar>-->
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
    // import Sidebar from '@/components/wallet/Sidebar';

    export default {
        components:{
            TopInfo,
            // Sidebar,
        },
    }
</script>
<style lang="scss" scoped>
    @use '../main';

    .wallet_view{
        /*padding: 18px 16px;*/
        padding-bottom: 0px;
        /*display: grid;*/
        /*grid-template-columns: max-content 1fr;*/
        /*grid-gap: 90px;*/
    }

    .wallet_main{
        height: 100%;
        display: grid;
        grid-template-rows: max-content 1fr;
        grid-gap: 15px;
    }

    #wallet_router{
        padding: 22px 20px;
        background-color: #fff;
        border-radius: 4px;
    }

    .page_fade-enter-active, .page_fade-leave-active {
        transition: all .2s;
    }
    .page_fade-enter, .page_fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
        transform: translateY(30px);
    }

    @media only screen and (max-width: main.$mobile_width) {
        .wallet_view{
            display: block;
        }

        .wallet_sidebar{
            display: none;
        }
    }

</style>

<style lang="scss">

</style>
