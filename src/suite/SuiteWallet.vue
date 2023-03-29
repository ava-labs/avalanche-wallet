<template>
    <div id="suite_wallet" class="v-application">
        <Wallet />
    </div>
</template>

<script lang="ts">
import Wallet from '@/views/Wallet.vue'

import vuetify from '@/plugins/vuetify_suite'
import i18n from '@/plugins/i18n'
import router from '@/router'
import store from '@/store'
//@ts-ignore
import font from '@/styles/fonts/suite.css'

export default {
    name: 'Suite-Wallet',
    i18n,
    router,
    store,
    vuetify,
    components: {
        Wallet,
    },
    async created() {
        font.__inject__(document.head)
    },
}
</script>

<!-- We have disabled vuetify style sheets because they go 
to document.head instead into the shaowDOM element -->
<style lang="sass">
@import '~vuetify/src/styles/main.sass'
@import '~vuetify/src/components/VBtn/VBtn.sass'
@import '~vuetify/src/components/VIcon/VIcon.sass'
@import '~vuetify/src/components/VList/VList.sass'
@import '~vuetify/src/components/VMain/VMain.sass'
@import '~vuetify/src/components/VRadioGroup/VRadio.sass'
@import '~vuetify/src/components/VRadioGroup/VRadioGroup.sass'
@import '~vuetify/src/components/VNavigationDrawer/VNavigationDrawer.sass'
@import '~vuetify/src/components/VTabs/VTabs.sass'
@import '~vuetify/src/components/VTooltip/VTooltip.sass'
</style>
<style lang="scss">
@use '../styles/main_suite';

#suite_wallet {
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: var(--primary-color);
    background-color: var(--bg) !important;
    font-family: 'Inter', sans-serif;
    transition-duration: 0.2s;
    --bg: #f1f5f9;
    --bg-1: 255, 255, 255;
    --bg-light: #e2e8f0;
    --bg-light-1: 245, 246, 250;
    --primary-color: #0f172a;
    --primary-color-light: #757575;
    --selection-color: #6a91d8;
    --link-secondary: #6e7479;
    --error: #c23f38;
    --success: #6bc688;
    --info: #2c7490;
    --info-1: 44, 116, 144;
    --bg-wallet: #f5f6fa;
    --warning: #f19d38;
    --bg-wallet-light: #ffffff;
    --primary-border-color: rgba(203, 213, 225, 0.12);
    --secondary-border-color: #e2e8f0;
    --disabled-color: #e2e8f0;
    --primary-contrast-text: #0f172a;
    --secondary-contrast-text: #ffffff;
    --sidebar-links: #64748b;
    --sidebar-background: #fff;
    --icon-color: #0f172a;
    --icon-color-light: #334155;
    // from root
    --border-radius-lg: 12px;
    --border-radius-sm: 7px;
    --primary-btn-border-color: #149ded;
    --secondary-color: #149ded;
    --primary-border: solid 1px var(--primary-border-color);
    --secondary-border: solid 1px var(--secondary-border-color);
    --box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;
    --tooltip-bg: rgba(51, 65, 85, 0.92);
}

#nav {
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
    background-color: transparent;
    padding: main_suite.$container_padding_m;
}

p {
    margin: 0px !important;
}
</style>
