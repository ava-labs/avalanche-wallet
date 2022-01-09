<template>
    <v-app>
        <v-main>
            <template>
                <UrlBanner></UrlBanner>
                <navbar v-show="isNavbar"></navbar>
                <div class="main_cols" :wallet_view="!isNavbar">
                    <UpgradeToAccountModal></UpgradeToAccountModal>
                    <transition name="fade" mode="out-in">
                        <router-view id="router_view" />
                    </transition>
                </div>
            </template>
        </v-main>
        <LedgerBlock ref="ledger_block"></LedgerBlock>
        <LedgerUpgrade></LedgerUpgrade>
        <LedgerWalletLoading></LedgerWalletLoading>
        <NetworkLoadingBlock></NetworkLoadingBlock>
        <notifications></notifications>
        <TestNetBanner></TestNetBanner>
    </v-app>
</template>
<script>
import Notifications from '@/components/Notifications'
import Navbar from './components/Navbar'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal'
import LedgerBlock from '@/components/modals/LedgerBlock'
import LedgerUpgrade from '@/components/modals/LedgerUpgrade'
import TestNetBanner from '@/components/TestNetBanner'
import NetworkLoadingBlock from '@/components/misc/NetworkLoadingBlock'
import UpgradeToAccountModal from '@/components/modals/SaveAccount/UpgradeToAccountModal'
import LedgerWalletLoading from '@/components/modals/LedgerWalletLoading'
import UrlBanner from '@/components/misc/UrlBanner'

export default {
    components: {
        UrlBanner,
        LedgerWalletLoading,
        UpgradeToAccountModal,
        NetworkLoadingBlock,
        LedgerBlock,
        LedgerUpgrade,
        SaveAccountModal,
        Navbar,
        Notifications,
        TestNetBanner,
    },
    async created() {
        // Init language preference
        let locale = localStorage.getItem('lang')
        if (locale) {
            this.$root.$i18n.locale = locale
        }

        await this.$store.dispatch('Network/init')
        this.$store.commit('Accounts/loadAccounts')
        this.$store.dispatch('Assets/initErc20List')
        this.$store.dispatch('Assets/ERC721/init')
        this.$store.dispatch('updateAvaxPrice')

        if (this.$store.state.Accounts.accounts.length > 0) {
            this.$router.push('/access')
        }
    },
    computed: {
        isNavbar() {
            if (this.$route.path.includes('/wallet')) {
                return false
            }
            return true
        },
    },
    metaInfo: {
        meta: [
            {
                vmid: 'description',
                name: 'description',
                content:
                    'Avalanche wallet is a simple, highly secure, non-custodial crypto wallet for storing AVAX.',
            },
            {
                vmid: 'og:description',
                name: 'description',
                content:
                    'Avalanche wallet is a simple, highly secure, non-custodial crypto wallet for storing AVAX.',
            },
            {
                vmid: 'og:title',
                name: 'og:title',
                content: 'Fastest Performing and Secure DeFi Wallet | Avalanche Wallet',
            },
        ],
        title: 'Fastest Performing and Secure DeFi Wallet',
        titleTemplate: '%s | Avalanche Wallet',
    },
}
</script>

<style scoped lang="scss">
@use "./main";

.main_cols {
    &[wallet_view] {
        height: 100vh;

        #router_view {
            overflow: auto;
            padding: 0;
            padding-bottom: 0px;
        }
    }

    #router_view {
        min-height: calc(100vh - 80px);
        position: relative;
        padding: main.$container_padding_m;
    }
}

#router_view {
    min-height: calc(100vh - 80px);
    position: relative;
    padding: main.$container_padding_m;
    overflow: auto;
}

/*.panel {*/
/*    background-color: #fff;*/
/*    overflow: auto;*/
/*    height: 100%;*/
/*}*/
</style>

<style lang="scss">
@use "./main";

html {
    height: 100%;
}

body {
    height: 100%;
}

p {
    margin: 0px !important;
}

#app {
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: var(--primary-color);
    background-color: var(--bg) !important;
    font-family: 'Rubik', sans-serif;
    transition-duration: 0.2s;
}

#nav {
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
    background-color: transparent;
    padding: main.$container_padding_m;
}

@include main.mobile-device {
    #router_view {
        padding: 9px !important;
    }

    #nav {
        padding: main.$container_padding_mobile;
        display: flex !important;
    }

    /*.main_cols {*/
    /*    grid-template-columns: 1fr !important;*/
    /*    &[wallet_view] {*/
    /*        height: auto !important;*/
    /*    }*/
    /*}*/
    .panel {
        display: none !important;
    }
}

@include main.medium-device {
    .main_cols {
        &[wallet_view] {
            grid-template-columns: 180px 1fr 240px !important;
        }
    }
}

@media only screen and (max-width: main.$width_s) {
    #router_view {
        padding: main.$container_padding_s;
    }
    #nav {
        padding: main.$container_padding_s;
    }
}
</style>
