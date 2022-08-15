<template>
    <div>
        <div>
            <div class="card_body">
                <header>
                    <h1>{{ $t('keys.title') }}</h1>
                    <div class="button_container" v-if="canEncryptWallet">
                        <button
                            v-if="!account"
                            @click="openSaveAccount"
                            class="save_account ava_button_secondary"
                        >
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
                        <button class="but_primary ava_button_secondary" @click="exportKeys">
                            <fa icon="upload"></fa>
                            {{ $t('keys.button3') }}
                        </button>
                        <SaveAccountModal ref="account_modal"></SaveAccountModal>
                        <AccountSettingsModal ref="account_settings"></AccountSettingsModal>
                        <ExportKeys ref="export" :wallets="allWallets"></ExportKeys>
                    </div>
                </header>
                <my-keys></my-keys>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'
import MyKeys from '@/components/wallet/manage/MyKeys.vue'
import ImportKeys from '@/components/modals/ImportKeys.vue'
import ExportKeys from '@/components/modals/ExportKeys.vue'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal.vue'

import { WalletNameType } from '@/js/wallets/types'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'

@Component({
    name: 'manage',
    components: {
        AccountSettingsModal,
        MyKeys,
        ImportKeys,
        ExportKeys,
        SaveAccountModal,
    },
})
export default class ManageKeys extends Vue {
    $refs!: {
        import: ImportKeys
        export: ExportKeys
        account_modal: SaveAccountModal
        account_settings: AccountSettingsModal
    }

    get account() {
        return this.$store.getters['Accounts/account']
    }

    importKeys() {
        this.$refs.import.open()
    }

    exportKeys() {
        this.$refs.export.open()
    }

    openSaveAccount() {
        this.$refs.account_modal.open()
    }

    openAccountSettings() {
        this.$refs.account_settings.open()
    }

    get canEncryptWallet() {
        return ['mnemonic', 'singleton'].includes(this.walletType)
    }

    get walletType(): WalletNameType {
        return this.$store.state.activeWallet.type
    }

    get hasVolatile() {
        return this.$store.state.volatileWallets.length > 0
    }

    get allWallets(): MnemonicWallet[] {
        return this.$store.state.wallets
    }

    get warnUpdateKeyfile() {
        return this.$store.state.warnUpdateKeyfile
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.button_container {
    display: flex;
    flex-direction: row;
    align-items: center;
}
header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

h1 {
    font-weight: lighter;
}

.save_account {
    color: var(--warning);
}

@include main.mobile-device {
    header {
        display: block;
    }

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
