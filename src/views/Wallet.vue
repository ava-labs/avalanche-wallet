<template>
    <div class="wallet_view" ref="wallet_view">
        <UpdateKeystoreModal v-if="isManageWarning"></UpdateKeystoreModal>
        <!-- <transition name="fade" mode="out-in">
            <sidebar class="panel sidenav"></sidebar>
        </transition> -->
        <div class="top-bar">
            <div class="container">
                <div class="links">
                    <router-link to="/wallet/home" class="wallet_link">
                        {{ $t('wallet.sidebar.portfolio') }}
                    </router-link>
                    <router-link
                        to="/wallet/home/transfer"
                        data-cy="wallet_transfer"
                        class="wallet_link"
                    >
                        {{ $t('wallet.sidebar.send') }}
                    </router-link>
                    <router-link
                        to="/wallet/home/cross_chain"
                        data-cy="wallet_export"
                        class="wallet_export wallet_link"
                    >
                        {{ $t('wallet.sidebar.export') }}
                    </router-link>
                    <router-link
                        to="/wallet/home/validator"
                        data-cy="wallet_validator"
                        class="wallet_validator wallet_link"
                    >
                        {{ $t('wallet.sidebar.validator') }}
                    </router-link>
                    <router-link to="/wallet/home/earn" data-cy="wallet_earn" class="wallet_link">
                        {{ $t('wallet.sidebar.earn') }}
                    </router-link>
                    <router-link
                        to="/wallet/home/studio"
                        data-cy="wallet_studio"
                        class="wallet_link"
                    >
                        {{ $t('wallet.sidebar.studio') }}
                    </router-link>
                    <router-link
                        to="/wallet/home/activity"
                        data-cy="wallet_activity"
                        class="wallet_link"
                    >
                        {{ $t('wallet.sidebar.activity') }}
                    </router-link>
                    <router-link to="/wallet/home/keys" data-cy="wallet_manage" class="wallet_link">
                        {{ $t('wallet.sidebar.manage') }}
                    </router-link>
                    <router-link
                        to="/wallet/home/advanced"
                        data-cy="wallet_advanced"
                        class="wallet_link"
                    >
                        {{ $t('wallet.sidebar.advanced') }}
                    </router-link>
                </div>
            </div>
        </div>
        <div class="container content">
            <div class="wallet_main">
                <top-info class="wallet_top"></top-info>
                <transition name="fade" mode="out-in">
                    <keep-alive
                        :exclude="[
                            'cross_chain',
                            'activity',
                            'advanced',
                            'earn',
                            'manage',
                            'studio',
                        ]"
                    >
                        <router-view id="wallet_router" :key="$route.path"></router-view>
                    </keep-alive>
                </transition>
            </div>
            <transition name="fade" mode="out-in">
                <main-panel />
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import TopInfo from '@/components/wallet/TopInfo.vue'
import Sidebar from '@/components/wallet/Sidebar.vue'
import MainPanel from '@/components/SidePanels/MainPanel.vue'
import UpdateKeystoreModal from '@/components/modals/UpdateKeystore/UpdateKeystoreModal.vue'

const TIMEOUT_DURATION = 60 * 7 // in seconds
const TIMEOUT_DUR_MS = TIMEOUT_DURATION * 1000

@Component({
    components: {
        Sidebar,
        MainPanel,
        TopInfo,
        UpdateKeystoreModal,
    },
})
export default class Wallet extends Vue {
    intervalId: NodeJS.Timeout | null = null
    logoutTimestamp = Date.now() + TIMEOUT_DUR_MS
    isLogOut = false
    helper = this.globalHelper()

    // define links
    links = [
        {
            id: 1,
            text: this.$t('wallet.sidebar.portfolio'),
            path: '/wallet/home',
        },
        {
            id: 2,
            text: this.$t('wallet.sidebar.send'),
            path: '/wallet/home/transfer',
        },
        {
            id: 3,
            text: this.$t('wallet.sidebar.export'),
            path: '/wallet/home/cross_chain',
        },
        {
            id: 4,
            text: this.$t('wallet.sidebar.validator'),
            path: '/wallet/home/validator',
        },
        {
            id: 5,
            text: this.$t('wallet.sidebar.earn'),
            path: '/wallet/home/earn',
        },
        {
            id: 6,
            text: this.$t('wallet.sidebar.studio'),
            path: '/wallet/home/studio',
        },
        {
            id: 7,
            text: this.$t('wallet.sidebar.activity'),
            path: '/wallet/home/activity',
        },
        {
            id: 8,
            text: this.$t('wallet.sidebar.manage'),
            path: '/wallet/home/keys',
        },
        {
            id: 9,
            text: this.$t('wallet.sidebar.advanced'),
            path: '/wallet/home/advanced',
        },
    ]

    // Set the logout timestamp to now + TIMEOUT_DUR_MS
    resetTimer() {
        this.logoutTimestamp = Date.now() + TIMEOUT_DUR_MS
    }

    checkLogout() {
        let now = Date.now()

        // Logout if current time is passed the logout timestamp
        if (now >= this.logoutTimestamp && !this.isLogOut) {
            this.isLogOut = true
            this.$store.dispatch('timeoutLogout')
            this.helper.updateSuiteStore(this.$store.state)
        }
    }

    created() {
        this.resetTimer()
        if (document.domain !== 'localhost')
            this.intervalId = setInterval(() => {
                this.checkLogout()
            }, 1000)
    }

    unload(event: BeforeUnloadEvent) {
        // user has no wallet saved
        if (!localStorage.getItem('w') && this.hasVolatileWallets && this.isLogOut) {
            event.preventDefault()
            this.isLogOut = false
            event.returnValue = ''
            this.$router.push('/wallet/home/keys')
            this.resetTimer()
        }
    }

    mounted() {
        let view = this.$refs.wallet_view as HTMLDivElement

        view.addEventListener('mousemove', this.resetTimer)
        view.addEventListener('mousedown', this.resetTimer)

        window.addEventListener('beforeunload', this.unload)
    }

    beforeDestroy() {
        let view = this.$refs.wallet_view as HTMLDivElement
        // Remove Event Listeners
        view.removeEventListener('mousemove', this.resetTimer)
        view.removeEventListener('mousedown', this.resetTimer)
        window.removeEventListener('beforeunload', this.unload)
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
<style scoped lang="scss">
@use '../styles/main';
.content {
    width: 100%;
    margin-top: 60px;
    display: grid;
    column-gap: 15px;
    background-color: var(--bg);
    grid-template-columns: 1fr 300px;
    align-items: center;
    padding: 12px 20px;
}

.top-bar {
    position: fixed;
    width: 100%;
    height: 60px;
    z-index: 999;
    display: flex;
    align-items: center;
    background-color: var(--bg);
    border-bottom: 1px solid rgba(145, 158, 171, 0.24);
    left: 0;
    justify-content: center;
    .links {
        display: flex;
        flex-direction: row;
        padding: 0px 10px;
        gap: 14px;
        a {
            opacity: 0.6;
            color: var(--sidebar-links);
            text-decoration: none;
            border-radius: var(--border-radius-lg);
            font-weight: 700;
        }

        .wallet_link {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            white-space: nowrap;
        }
        a.router-link-exact-active {
            color: var(--primary-color) !important;
            opacity: 1;
        }
    }
    .container {
        padding: 0px;
        overflow: auto;
    }
}

@media screen and (max-width: 900px) {
    .top-bar {
        top: 65px;
    }
}
@media screen and (max-width: 900px) {
    .content {
        grid-template-columns: 1fr;
    }
}
@media screen and (max-width: 600px) {
    .content {
        padding: 12px 0px;
    }
}
</style>
