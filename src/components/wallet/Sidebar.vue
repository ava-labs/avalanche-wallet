<template>
    <div class="wallet_sidebar">
        <div class="brand">
            <img src="@/assets/wallet_logo.svg" />
        </div>
        <div class="links">
            <router-link to="/wallet">
                <img src="@/assets/sidebar/portfolio_nav.png" />
                Portfolio
            </router-link>
            <router-link to="/wallet/keys">
                <img src="@/assets/sidebar/manage_nav.png" />
                Manage
            </router-link>
            <router-link to="/wallet/transfer">
                <img src="@/assets/sidebar/transfer_nav.png" />
                Send
            </router-link>
        </div>
    </div>
</template>
<style lang="scss" scoped>
@use "../../main";

.wallet_sidebar {

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
        }

        a.router-link-exact-active {
            color: main.$primary-color !important;
            opacity: 1;
            background-color: #f5f6fa;
        }

        img {
            width: 20px;
            margin-right: 15px;
            object-fit: contain;
        }
    }
}
</style>
