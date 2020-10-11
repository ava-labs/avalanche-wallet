<template>
    <div class="wallet_sidebar">
        <div class="stick">
            <div class="brand">
                <img v-if="$root.theme==='day'" src="@/assets/wallet_logo.svg" />
                <img v-else src="@/assets/wallet_logo_dark.svg" />
            </div>
            <div class="links">
                <router-link to="/wallet">
                    <img v-if="$root.theme==='day'" src="@/assets/sidebar/portfolio_nav.png" />
                    <img v-else src="@/assets/sidebar/portfolio_nav_night.png" />
                    {{$t('wallet.sidebar.portfolio')}}
                </router-link>
                <router-link to="/wallet/keys" data-cy="wallet_manage">
                    <img v-if="$root.theme==='day'" src="@/assets/sidebar/manage_nav.png" />
                    <img v-else src="@/assets/sidebar/manage_nav_night.svg" />
                    {{$t('wallet.sidebar.manage')}}
                </router-link>
                <router-link to="/wallet/transfer" data-cy="wallet_transfer">
                    <img v-if="$root.theme==='day'" src="@/assets/sidebar/transfer_nav.png" />
                    <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
                    {{$t('wallet.sidebar.send')}}
                </router-link>
                <router-link to="/wallet/earn" data-cy="wallet_earn">
                    <img v-if="$root.theme==='day'" src="@/assets/sidebar/earn_nav.png" />
                    <img v-else src="@/assets/sidebar/earn_nav_night.png" />
                    {{$t('wallet.sidebar.earn')}}
                </router-link>
                <router-link to="/wallet/advanced" data-cy="wallet_advanced">
                    <img v-if="$root.theme==='day'" src="@/assets/sidebar/advanced_nav.png" />
                    <img v-else src="@/assets/sidebar/advanced_nav_night.png" />
                    {{$t('wallet.sidebar.advanced')}}
                </router-link>
            </div>
            <div class="bottom">
                <LanguageSelect></LanguageSelect>
            </div>
        </div>
    </div>
</template>
<script>
    import LanguageSelect from "@/components/misc/LanguageSelect/LanguageSelect";
    export default {
        components: {
            LanguageSelect
        }
    }
</script>
<style lang="scss" scoped>
@use "../../main";

.wallet_sidebar {
    position: relative;

    .stick{
        position: sticky;
        display: flex;
        flex-direction: column;
        height: 100%;
        top: 0;
    }
    .alert_icon{
        color: #f00;
        flex-grow: 1;
        justify-content: flex-end;
    }

    .brand {
        height: 150px;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
            width: 80%;
            object-fit: contain;
        }
    }

    .links {
        padding: 0 !important;
        display: flex;
        flex-direction: column;

        a {
            display: flex;
            align-items: center;
            padding: 14px 24px;
            white-space: nowrap;
            opacity: 0.6;
            color: var(--primary-color-light);
            text-decoration: none;

            img{
                opacity: 0.5;
            }
        }

        a.router-link-exact-active {
            color: var(--primary-color) !important;
            opacity: 1;
            background-color: var(--bg-wallet);

            img{
                opacity: 1;
            }
        }

        img {
            width: 20px;
            margin-right: 15px;
            object-fit: contain;
        }
    }
}


.bottom{
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 20px;
}
</style>
