<template>
    <div class="wallet_view">
        <transition name="fade" mode="out-in">
            <sidebar class="panel"></sidebar>
        </transition>
        <div class="wallet_main">
            <top-info class="wallet_top"></top-info>
            <transition name="page_fade" mode="out-in">
                <keep-alive include="WalletHome">
                    <router-view id="wallet_router"></router-view>
                </keep-alive>
            </transition>
        </div>
        <transition name="fade" mode="out-in">
            <main-panel class="panel"></main-panel>
        </transition>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import TopInfo from "@/components/wallet/TopInfo.vue";
import Sidebar from '@/components/wallet/Sidebar.vue';
import MainPanel from '@/components/SidePanels/MainPanel.vue';

@Component({
    components: {
        Sidebar,
        MainPanel,
        TopInfo
    }
})
export default class Wallet extends Vue {}
</script>

<style lang="scss" scoped>
@use '../main';

.wallet_view {
    padding-bottom: 0;
    display: grid;
    grid-template-columns: 240px 1fr 340px;
    column-gap: 15px;
    height: 100%;

}

.panel{
    background-color: #fff;
    /*padding: 8px 16px;*/
    overflow: auto;
    height: 100%;

}

.wallet_main {
    height: 100%;
    display: grid;
    grid-template-rows: max-content 1fr;
    grid-gap: 15px;
    padding-top: 15px;
}

#wallet_router {
    padding: 22px 20px;
    background-color: #fff;
    border-radius: 4px;
}

.page_fade-enter-active,
.page_fade-leave-active {
    transition: all 0.2s;
}
.page_fade-enter, .page_fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
}

@media only screen and (max-width: main.$mobile_width) {
    .wallet_view {
        display: block;
    }

    .wallet_sidebar {
        display: none;
    }
}


@include main.medium-device {
    .wallet_view {
        grid-template-columns: 180px 1fr 240px !important;
    }
}
</style>
