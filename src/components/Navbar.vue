<template>
    <div id="nav">
        <ConfirmLogout ref="logout"></ConfirmLogout>
        <router-link to="/" class="logo">
            <img v-if="$root.theme === 'day'" src="@/assets/wallet_logo.png" />
            <img v-else src="@/assets/wallet_logo_dark.png" />
            <!--            <span class="slogan">by Avalanche</span>-->
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
            <network-menu></network-menu>
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
            style="z-index: 999"
            hide-overlay
        >
            <v-list dense nav>
                <div style="display: flex; justify-content: space-between; padding: 4px 8px">
                    <img v-if="$root.theme === 'day'" src="@/assets/wallet_logo.svg" />
                    <img v-else src="@/assets/wallet_logo_dark.svg" />
                    <DayNightToggle class="action_but"></DayNightToggle>
                </div>
                <template v-if="isAuth">
                    <router-link to="/wallet">{{ $t('wallet.sidebar.portfolio') }}</router-link>
                    <router-link to="/wallet/transfer">{{ $t('wallet.sidebar.send') }}</router-link>
                    <router-link to="/wallet/cross_chain">
                        {{ $t('wallet.sidebar.export') }}
                    </router-link>
                    <router-link to="/wallet/earn">{{ $t('wallet.sidebar.earn') }}</router-link>
                    <router-link to="/wallet/activity">Activity</router-link>
                    <router-link to="/wallet/keys">{{ $t('wallet.sidebar.manage') }}</router-link>
                    <router-link to="/wallet/advanced" data-cy="wallet_advanced">
                        {{ $t('wallet.sidebar.advanced') }}
                    </router-link>
                    <button class="logout" @click="logout">
                        {{ $t('logout.button') }}
                    </button>

                    <!--                    <v-list-item to="/wallet/">Home</v-list-item>-->
                    <!--                    <v-list-item to="/wallet/keys">Manage Keys</v-list-item>-->
                    <!--                    <v-list-item to="/wallet/transfer">Transfer</v-list-item>-->
                    <!--                    <v-list-item @click="logout"><Log out/v-list-item>-->
                </template>
                <template v-else>
                    <router-link to="/access">{{ $t('nav.access') }}</router-link>
                    <router-link to="/create">{{ $t('nav.create') }}</router-link>
                </template>
                <div class="mobile_bottom">
                    <AccountMenu></AccountMenu>
                    <LanguageSelect class="lang_mobile"></LanguageSelect>
                </div>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
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
    }
}
</script>
<style scoped lang="scss">
@use '../main';
@use "../light_theme";

img {
    max-height: 25px;
}

a {
    text-decoration: none;
    font-weight: normal;
    white-space: nowrap;
    margin-right: 15px;
}

button {
    font-weight: normal;
}

.daynight {
    margin-right: 15px;
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
    border-radius: 4px;
}

.mobile_right {
    display: none;
}

.mobile_bottom {
    position: absolute;
    bottom: 30px;

    > * {
        padding: 4px 8px;
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

    .logout {
        margin-top: 40px;
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
        background-color: var(--bg);
        color: var(--primary-color) !important;
    }
}
</style>
