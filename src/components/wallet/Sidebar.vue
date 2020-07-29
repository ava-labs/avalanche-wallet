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
                    Portfolio
                </router-link>
                <router-link to="/wallet/keys">
                    <img v-if="$root.theme==='day'" src="@/assets/sidebar/manage_nav.png" />
                    <img v-else src="@/assets/sidebar/manage_nav_night.svg" />
                    Manage
                </router-link>
                <router-link to="/wallet/transfer">
                    <img v-if="$root.theme==='day'" src="@/assets/sidebar/transfer_nav.png" />
                    <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
                    Send
                </router-link>
            </div>



            <v-alert type="error" style="margin: 8px; font-size: 14px;" dense text v-if="isManageWarning" :icon="false">
                <h3>Outdated Keystore File</h3>
                <p>
                    <br>
                    We have upgraded the encryption tools used for keystore files.
                    <br><br>
                    We recommend everyone to download the new file and delete the old one permanently.
                </p>

                <button @click="exportKeys" class="button_primary" style="margin: 10px 0; border-radius: 4px; padding: 6px 12px;">Download New Keystore File</button>
            </v-alert>
        </div>

        <ExportKeys ref="export" :wallets="allWallets"></ExportKeys>
    </div>
</template>
<script>
    import ExportKeys from '@/components/modals/ExportKeys';


    export default {
        components: {
            ExportKeys
        },
        computed: {
            isManageWarning(){
                if(this.$store.state.warnUpdateKeyfile){
                    return true;
                }
                return false;
            },
            allWallets(){
                return this.$store.state.wallets;
            }
        },
        methods:{
            exportKeys(){
                this.$refs.export.open();
            }
        }
    }
</script>
<style lang="scss" scoped>
@use "../../main";

.wallet_sidebar {
    position: relative;

    .stick{
        position: sticky;
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
</style>
