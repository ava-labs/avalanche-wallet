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
<style scoped lang="scss">
@import '../../styles/main';

.main_panel {
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    padding-top: 8px;
    padding-bottom: 8px;
    height: 100vh;
    min-height: 100%;
}
.panel_nav {
    @include component-wrapper;
    background-color: var(--bg-wallet-light);
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    padding: 24px 16px;
    font-size: 14px;
    > * {
        outline: none !important;
        padding: 4px 8px;
        border-radius: var(--border-radius-sm);
    }
}

.hover_but {
    transition-duration: 0.2s;
    cursor: pointer;
    &:hover {
        box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.3);
    }
}

.panel_content {
    overflow: auto;
    background-color: var(--bg-wallet-light);
    height: 100%;
    flex: 1;
}

.logout {
    margin-left: auto;
}

@include medium-device {
    .panel_nav {
        padding: 12px 16px;
    }
}
</style>
