<template>
    <div class="button_container" v-if="canEncryptWallet">
        <button v-if="!account" @click="openSaveAccount" class="save_account ava_button_secondary">
            <fa icon="exclamation-triangle"></fa>
            {{ $t('keys.button1') }}
        </button>
        <button
            v-if="hasVolatile && account"
            @click="openAccountSettings"
            class="save_account ava_button_secondary"
        >
            <fa icon="exclamation-triangle"></fa>
            {{ $t('keys.button1') }}
        </button>
        <AccountSettingsModal ref="account_settings"></AccountSettingsModal>
        <SaveAccountModal :setAccount="helpers.setAccount" ref="account_modal"></SaveAccountModal>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'
import { WalletNameType } from '@/js/wallets/types'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal.vue'
@Component({
    name: 'manage',
    components: {
        SaveAccountModal,
        AccountSettingsModal,
    },
})
export default class SaveKeysButton extends Vue {
    helpers = this.globalHelper()
    $refs!: {
        account_settings: AccountSettingsModal
        account_modal: SaveAccountModal
    }
    get account() {
        return this.$store.getters['Accounts/account']
    }
    openAccountSettings() {
        this.$refs.account_settings.open()
    }
    openSaveAccount() {
        this.$refs.account_modal.open()
    }
    get canEncryptWallet() {
        return ['mnemonic', 'singleton', 'multisig'].includes(this.walletType)
    }
    get walletType(): WalletNameType {
        return this.$store.state.activeWallet?.type
    }
    get hasVolatile() {
        return this.$store.getters.accountChanged
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/abstracts/mixins';
.button_container {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.save_account {
    color: var(--warning);
}
@include mixins.mobile-device {
    .button_container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        /*flex-wrap: wrap;*/
        button {
            padding: 8px 0;
        }
    }
}
</style>
