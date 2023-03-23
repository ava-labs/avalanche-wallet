<template>
    <v-app>
        <v-main>
            <template>
                <!-- <UrlBanner></UrlBanner> -->

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
    </v-app>
</template>

<script>
import Notifications from '@/components/Notifications'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal'
import LedgerBlock from '@/components/modals/LedgerBlock'
import LedgerUpgrade from '@/components/modals/LedgerUpgrade'
import NetworkLoadingBlock from '@/components/misc/NetworkLoadingBlock'
import UpgradeToAccountModal from '@/components/modals/SaveAccount/UpgradeToAccountModal'
import LedgerWalletLoading from '@/components/modals/LedgerWalletLoading'
import UrlBanner from '@/components/misc/UrlBanner'
import router from '@/router'
export default {
    components: {
        UrlBanner,
        LedgerWalletLoading,
        UpgradeToAccountModal,
        NetworkLoadingBlock,
        LedgerBlock,
        LedgerUpgrade,
        SaveAccountModal,
        Notifications,
    },
    async created() {
        if (router.currentRoute.path !== '/wallet/home') router.push('/wallet/home')
    },
    mounted() {
        let { updateSuiteStore } = this.globalHelper()
        updateSuiteStore(this.$store.state)
    },

    metaInfo: {
        meta: [
            {
                vmid: 'description',
                name: 'description',
                content:
                    'Camino wallet is a simple, highly secure, non-custodial crypto wallet for storing CAM.',
            },
            {
                vmid: 'og:description',
                name: 'description',
                content:
                    'Camino wallet is a simple, highly secure, non-custodial crypto wallet for storing CAM.',
            },
            {
                vmid: 'og:title',
                name: 'og:title',
                content: 'Camino Wallet',
            },
        ],
        title: 'Camino Wallet',
    },
}
</script>

<style scoped lang="scss">
@use './styles/main';

.main_cols {
    &[wallet_view] {
        // height: 100vh;

        #router_view {
            padding: 0;
            padding-bottom: 0px;
        }
    }

    #router_view {
        position: relative;
        min-height: calc(100vh - 80px);
        display: flex;
        justify-content: center;
    }
}

#router_view {
    position: relative;
}
</style>

<style lang="scss">
@use './styles/main';

html {
    height: 100%;
    overflow-y: auto;
}

body {
    height: 100%;
}

.v-application.v-application p {
    margin-bottom: 0px;
}

.v-application--wrap {
    min-height: 100% !important;
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

.v-main__wrap {
    display: flex;
}

.main_cols {
    flex: 1;
    display: flex;
}

#router_view {
    flex: 1;
}

@include main.mobile-device {
    #nav {
        padding: main.$container_padding_mobile;
        display: flex !important;
    }

    .panel {
        display: none !important;
    }
    .main_cols {
        &[wallet_view] {
            #router_view {
                padding: 0;
            }
        }

        #router_view {
            padding: main.$container_padding_s;
        }
    }

    #router_view {
        padding: main.$container_padding_s;
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
