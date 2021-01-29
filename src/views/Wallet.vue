<template>
    <div class="wallet_view" ref="wallet_view">
        <UpdateKeystoreModal v-if="isManageWarning"></UpdateKeystoreModal>
        <transition name="fade" mode="out-in">
            <sidebar class="panel sidenav"></sidebar>
        </transition>
        <div class="wallet_main">
            <top-info class="wallet_top"></top-info>
            <transition name="page_fade" mode="out-in">
                <keep-alive>
                    <router-view id="wallet_router" :key="$route.path"></router-view>
                </keep-alive>
            </transition>
        </div>
        <transition name="fade" mode="out-in">
            <main-panel class="panel"></main-panel>
        </transition>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import TopInfo from '@/components/wallet/TopInfo.vue'
import Sidebar from '@/components/wallet/Sidebar.vue'
import MainPanel from '@/components/SidePanels/MainPanel.vue'
import UpdateKeystoreModal from '@/components/modals/UpdateKeystore/UpdateKeystoreModal.vue'

const TIMEOUT_DURATION = 60 * 7 // in seconds

@Component({
    components: {
        Sidebar,
        MainPanel,
        TopInfo,
        UpdateKeystoreModal,
    },
})
export default class Wallet extends Vue {
    inactiveDur: number = TIMEOUT_DURATION
    intervalId: NodeJS.Timeout | null = null

    resetTimer() {
        this.inactiveDur = TIMEOUT_DURATION
    }

    created() {
        this.intervalId = setInterval(() => {
            this.inactiveDur -= 1
            if (this.inactiveDur <= 0) {
                this.$store.dispatch('timeoutLogout')
            }
        }, 1000)
    }

    unload(event: BeforeUnloadEvent) {
        // user has no wallet saved
        if (!localStorage.getItem('w') && this.hasVolatileWallets) {
            event.preventDefault()
            event.returnValue = ''
            this.$router.push('/wallet/keys')
        }
    }

    mounted() {
        let view = this.$refs.wallet_view as HTMLDivElement

        view.addEventListener('mousemove', this.resetTimer)
        view.addEventListener('mousedown', this.resetTimer)

        window.addEventListener('beforeunload', this.unload)
    }

    destroyed() {
        clearInterval(this.intervalId!)
    }

    get isManageWarning(): boolean {
        if (this.$store.state.warnUpdateKeyfile) {
            return true
        }
        return false
    }

    get hasVolatileWallets() {
        return this.$store.state.volatileWallets.length > 0
    }
}
</script>

<style lang="scss" scoped>
@use '../main';

.wallet_view {
    padding-bottom: 0;
    display: grid;
    grid-template-columns: 200px 1fr 300px;
    column-gap: 15px;
    height: 100%;
    background-color: var(--bg-wallet);
}

.sidenav {
    background-color: var(--bg-wallet-light);
}

.panel {
    overflow: auto;
    height: 100%;
}

.wallet_main {
    height: 100%;
    display: grid;
    grid-template-rows: max-content 1fr;
    grid-gap: 15px;
    padding-top: 8px;
}

#wallet_router {
    padding: 22px 20px;
    background-color: var(--bg-wallet-light);
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

@include main.mobile-device {
    .wallet_view {
        display: block;
        column-gap: 9px;
    }
    .wallet_main {
        grid-gap: 9px;
        padding-top: 0;
    }

    .wallet_sidebar {
        display: none;
    }
}

@include main.medium-device {
    .wallet_view {
        grid-template-columns: 180px 1fr 240px !important;
        column-gap: 9px;
    }

    .wallet_main {
        grid-gap: 9px;
    }

    #wallet_router {
        padding: 12px 18px;
    }
}
</style>
