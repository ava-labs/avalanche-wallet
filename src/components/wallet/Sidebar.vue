<template>
    <div class="wallet_sidebar">
        <div class="stick">
            <div class="brand">
                <img src="@/assets/camino_logo.png" />
            </div>
            <div class="links">
                <router-link to="/wallet" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/portfolio_nav.png" />
                    <img v-else src="@/assets/sidebar/portfolio_nav_night.png" />
                    {{ $t('wallet.sidebar.portfolio') }}
                </router-link>
                <router-link to="/wallet/transfer" data-cy="wallet_transfer" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/transfer_nav.png" />
                    <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
                    {{ $t('wallet.sidebar.send') }}
                </router-link>
                <router-link
                    to="/wallet/cross_chain"
                    data-cy="wallet_export"
                    class="wallet_export wallet_link"
                >
                    <span><fa icon="random" class="icon"></fa></span>
                    {{ $t('wallet.sidebar.export') }}
                </router-link>
                <router-link to="/wallet/earn" data-cy="wallet_earn" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/earn_nav.png" />
                    <img v-else src="@/assets/sidebar/earn_nav_night.png" />
                    {{ $t('wallet.sidebar.earn') }}
                </router-link>
                <router-link to="/wallet/studio" data-cy="wallet_studio" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/studio_nav.svg" />
                    <img v-else src="@/assets/sidebar/studio_nav_night.svg" />
                    {{ $t('wallet.sidebar.studio') }}
                </router-link>
                <router-link to="/wallet/activity" data-cy="wallet_activity" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/activity_nav.svg" />
                    <img v-else src="@/assets/sidebar/activity_nav_night.svg" />
                    {{ $t('wallet.sidebar.activity') }}
                </router-link>
                <router-link to="/wallet/keys" data-cy="wallet_manage" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/manage_nav.png" />
                    <img v-else src="@/assets/sidebar/manage_nav_night.svg" />
                    {{ $t('wallet.sidebar.manage') }}
                </router-link>
                <router-link to="/wallet/advanced" data-cy="wallet_advanced" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/advanced_nav.png" />
                    <img v-else src="@/assets/sidebar/advanced_nav_night.png" />
                    {{ $t('wallet.sidebar.advanced') }}
                </router-link>
                <!--router-link to="/wallet/launch" data-cy="wallet_launch" class="wallet_link">
                    <img v-if="$root.theme === 'day'" src="@/assets/sidebar/launch_nav_day.png" />
                    <img v-else src="@/assets/sidebar/launch_nav_night.png" />
                    {{ $t('wallet.sidebar.launch') }}
                </router-link-->
            </div>
            <div class="bottom">
                <AccountMenu></AccountMenu>
                <LanguageSelect></LanguageSelect>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageSelect from '@/components/misc/LanguageSelect/LanguageSelect'
import AccountMenu from '@/components/wallet/sidebar/AccountMenu'
export default {
    components: {
        AccountMenu,
        LanguageSelect,
    },
}
</script>
