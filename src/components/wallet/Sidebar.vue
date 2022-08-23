<template>
    <div class="wallet_sidebar">
        <div class="stick">
            <div class="brand">
                <img src="@/assets/camino_logo.png" />
            </div>
            <div class="links">
                <router-link to="/wallet" class="wallet_link">
                    <v-icon>mdi-wallet-outline</v-icon>
                    {{ $t('wallet.sidebar.portfolio') }}
                </router-link>
                <router-link to="/wallet/transfer" data-cy="wallet_transfer" class="wallet_link">
                    <v-icon>mdi-send-outline</v-icon>
                    {{ $t('wallet.sidebar.send') }}
                </router-link>
                <router-link
                    to="/wallet/cross_chain"
                    data-cy="wallet_export"
                    class="wallet_export wallet_link"
                >
                    <v-icon>mdi-shuffle</v-icon>
                    {{ $t('wallet.sidebar.export') }}
                </router-link>
                <router-link to="/wallet/earn" data-cy="wallet_earn" class="wallet_link">
                    <v-icon>mdi-hand-coin-outline</v-icon>
                    {{ $t('wallet.sidebar.earn') }}
                </router-link>
                <router-link to="/wallet/studio" data-cy="wallet_studio" class="wallet_link">
                    <v-icon>mdi-file-table-box-multiple-outline</v-icon>
                    {{ $t('wallet.sidebar.studio') }}
                </router-link>
                <router-link to="/wallet/activity" data-cy="wallet_activity" class="wallet_link">
                    <v-icon>mdi-update</v-icon>
                    {{ $t('wallet.sidebar.activity') }}
                </router-link>
                <router-link to="/wallet/keys" data-cy="wallet_manage" class="wallet_link">
                    <v-icon>mdi-qrcode</v-icon>
                    {{ $t('wallet.sidebar.manage') }}
                </router-link>
                <router-link to="/wallet/advanced" data-cy="wallet_advanced" class="wallet_link">
                    <v-icon>mdi-cog-outline</v-icon>
                    {{ $t('wallet.sidebar.advanced') }}
                </router-link>
            </div>
            <div class="bottom sidebar_bottom">
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
