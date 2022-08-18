<template>
    <div class="main_panel">
        <ConfirmLogout ref="logout"></ConfirmLogout>
        <div class="panel_nav panel">
            <DayNightToggle></DayNightToggle>
            <network-menu class="net_menu"></network-menu>
            <button @click="logout" class="logout">
                {{ $t('logout.button') }}
            </button>
        </div>
        <transition name="fade" mode="out-in">
            <transaction-history-panel class="panel_content"></transaction-history-panel>
        </transition>
    </div>
</template>
<script>
import NetworkMenu from '../NetworkSettings/NetworkMenu'
import TransactionHistoryPanel from './TransactionHistoryPanel'
import DayNightToggle from '@/components/misc/DayNightToggle'
import ConfirmLogout from '@/components/modals/ConfirmLogout.vue'

export default {
    components: {
        NetworkMenu,
        TransactionHistoryPanel,
        DayNightToggle,
        ConfirmLogout,
    },
    methods: {
        logout() {
            // this.$store.dispatch('logout');
            // @ts-ignore
            this.$refs.logout.open()
        },
    },
}
</script>
<!-- <style scoped lang="scss">
@use '../../styles/main';
</style> -->
