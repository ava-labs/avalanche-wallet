<template>
    <div id="nav">
        <ConfirmLogout ref="logout"></ConfirmLogout>
        <router-link to="/" class="logo">
            <img src="@/assets/camino_logo.png" />
        </router-link>
        <v-spacer></v-spacer>

        <div class="buts_right">
            <DayNightToggle class="action_but"></DayNightToggle>
            <template v-if="isAuth">
                <button @click="logout">{{ $t('logout.button') }}</button>
            </template>
            <template v-else>
                <router-link to="/access" class="action_but" data-cy="access">
                    {{ $t('nav.access') }}
                </router-link>
                <router-link to="/create" class="action_but" data-cy="create">
                    {{ $t('nav.create') }}
                </router-link>
            </template>
        </div>
        <network-menu />
        <div class="buts_right">
            <LanguageSelect class="lang_web"></LanguageSelect>
        </div>
        <div class="mobile_right">
            <v-btn @click="isDrawer = !isDrawer" icon class="mobile_drawer">
                <fa icon="bars"></fa>
            </v-btn>
        </div>

        <!--   MOBILE MENU     -->
        <v-navigation-drawer
            ref="drawer"
            class="mobile_menu"
            v-model="isDrawer"
            fixed
            style="z-index: 999; height: 100vh"
            overlay-color="var(--bg-wallet-light)"
            overlay-opacity="0.5"
            absolute
        >
            <v-list dense nav class="sidebar-list">
                <div class="mobile_top">
                    <div
                        style="
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 8px 16px 8px;
                        "
                    >
                        <img src="@/assets/camino_logo.png" />
                        <DayNightToggle class="action_but"></DayNightToggle>
                    </div>
                    <template v-if="isAuth">
                        <router-link to="/wallet">{{ $t('wallet.sidebar.portfolio') }}</router-link>
                        <router-link to="/wallet/transfer">
                            {{ $t('wallet.sidebar.send') }}
                        </router-link>
                        <router-link to="/wallet/cross_chain">
                            {{ $t('wallet.sidebar.export') }}
                        </router-link>
                        <router-link to="/wallet/earn">{{ $t('wallet.sidebar.earn') }}</router-link>
                        <router-link to="/wallet/studio">
                            {{ $t('wallet.sidebar.studio') }}
                        </router-link>
                        <router-link to="/wallet/activity">
                            {{ $t('wallet.sidebar.activity') }}
                        </router-link>
                        <router-link to="/wallet/keys">
                            {{ $t('wallet.sidebar.manage') }}
                        </router-link>
                        <router-link to="/wallet/advanced" data-cy="wallet_advanced">
                            {{ $t('wallet.sidebar.advanced') }}
                        </router-link>

                        <!--                    <v-list-item to="/wallet/">Home</v-list-item>-->
                        <!--                    <v-list-item to="/wallet/keys">Manage Keys</v-list-item>-->
                        <!--                    <v-list-item to="/wallet/transfer">Transfer</v-list-item>-->
                        <!--                    <v-list-item @click="logout"><Log out/v-list-item>-->
                    </template>
                    <template v-else>
                        <router-link to="/access">{{ $t('nav.access') }}</router-link>
                        <router-link to="/create">{{ $t('nav.create') }}</router-link>
                    </template>
                </div>
                <div class="mobile_bottom">
                    <AccountMenu class="mobile_account_menu"></AccountMenu>
                    <LanguageSelect class="lang_mobile"></LanguageSelect>
                    <button class="logout" @click="logout">
                        {{ $t('logout.button') }}
                    </button>
                </div>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'
import LanguageSelect from './misc/LanguageSelect/LanguageSelect.vue'
import DayNightToggle from '@/components/misc/DayNightToggle.vue'
import NetworkMenu from './NetworkSettings/NetworkMenu.vue'
import ConfirmLogout from '@/components/modals/ConfirmLogout.vue'
import AccountMenu from '@/components/wallet/sidebar/AccountMenu.vue'
@Component({
    components: {
        AccountMenu,
        NetworkMenu,
        DayNightToggle,
        ConfirmLogout,
        LanguageSelect,
    },
})
export default class Navbar extends Vue {
    isDrawer: boolean = false

    get isAuth(): boolean {
        return this.$store.state.isAuth
    }

    logout(): void {
        // @ts-ignore
        this.$refs.logout.open()
        this.isDrawer = false
    }
}
</script>
<style scoped lang="scss">
@use '../styles/main';

img {
    max-height: 25px;
}

a {
    text-decoration: none;
    font-weight: normal;
    white-space: nowrap;
}

button {
    font-weight: normal;
}

.daynight {
    margin-right: 15px;
}

.v-list--nav {
    height: inherit;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

#nav {
    .logo {
        display: flex;
        align-items: center;
        color: var(--primary-color-light) !important;
        font-size: 11px;
        font-weight: 700;

        &:hover {
            opacity: 0.7;
        }

        img {
            height: 30px;
            max-height: none !important;
            object-fit: contain;
            margin-right: 5px;
        }
    }
}

.buts_right {
    display: flex;
    align-items: center;

    a {
        margin: 0;
    }
}

.action_but {
    color: var(--primary-color) !important;
    padding: 0 12px;
    border-radius: var(--border-radius-sm);
}

.mobile_right {
    display: none;
}

.mobile_bottom {
}

.mobile_account_menu {
    display: flex;
    flex-direction: column;
    padding: 8px 8px;
    button:not(last-child) {
        margin-bottom: 16px;
    }
}

.lang_mobile,
.lang_web {
    width: max-content;
    margin: 0;
}

@include main.medium-device {
    img {
        max-height: 18px;
    }
    .buts_right {
        button {
            font-size: 11px;
        }
    }
}

@include main.mobile-device {
    .lang_web {
        display: none;
    }

    .buts_right {
        display: none;

        .router-link-exact-active {
            background-color: #42b983;
        }
    }

    .mobile_right {
        display: block;
    }

    .mobile_drawer {
        color: var(--primary-color) !important;
    }

    .mobile_account_menu {
        margin-bottom: 16px;
        padding: 0px;
    }

    .logout {
        padding: 16px 0px !important;
    }
}
</style>
<style lang="scss">
.mobile_menu {
    overflow: visible !important;
    background-color: var(--bg-light) !important;

    .v-list-item,
    .v-list-item--link {
        color: var(--primary-color-light) !important;
    }

    .v-list-item--active {
        color: var(--primary-color) !important;
    }

    a,
    .logout {
        display: block;
        padding: 8px 8px;
        color: var(--primary-color-light) !important;
    }

    .router-link-exact-active {
        background-color: var(--bg-wallet);
        color: var(--primary-color) !important;
        border-radius: var(--border-radius-sm);
    }
    .mobile_account_menu {
        button:not(:last-of-type) {
            margin-bottom: 8px;
        }
        button:not(:first-of-type) {
            margin-top: 8px;
        }
    }
}
.v-overlay__scrim {
    height: 100vh !important;
}
</style>
