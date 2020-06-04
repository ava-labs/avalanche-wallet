<template>
    <div class="main_panel">
        <div class="panel_nav">
            <network-menu class="net_menu"></network-menu>
            <button @click="logout">Log out</button>
        </div>
        <transition name="fade" mode="out-in">
            <transaction-history-panel class="panel_content"></transaction-history-panel>
        </transition>
    </div>
</template>
<script>
    import NetworkMenu from '../NetworkSettings/NetworkMenu';
    import TransactionHistoryPanel from './TransactionHistoryPanel';
    export default {
        components: {
            NetworkMenu,
            TransactionHistoryPanel
        },
        methods: {
            logout(){
                this.$store.dispatch('logout');
            },
        },
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    .main_panel{
        display: grid;
        grid-template-rows: max-content 1fr;
    }
    .panel_nav{
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: space-between;
        padding: 24px 16px;
        font-size: 14px;
    }

    .panel_content{
        overflow: auto;
        height: 100%;
    }

    @include main.medium-device {
        .panel_nav{
            padding: 12px 16px;
        }
    }
</style>
