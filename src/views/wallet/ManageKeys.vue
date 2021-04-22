<template>
    <div>
        <div>
            <div class="card_body">
                <header>
                    <h1>{{ $t('keys.title') }}</h1>
                    <div class="button_container" v-if="canEncryptWallet">
                        <button
                            v-if="!existsInLocalStorage || hasVolatile"
                            @click="openSaveAccount"
                            class="save_account ava_button_secondary"
                        >
                            <fa icon="exclamation-triangle"></fa>
                            {{ $t('keys.button1') }}
                        </button>
                        <button class="but_primary ava_button_secondary" @click="importKeys">
                            <fa icon="download"></fa>
                            {{ $t('keys.button2') }}
                        </button>
                        <ImportKeys ref="import"></ImportKeys>
                        <button class="but_primary ava_button_secondary" @click="exportKeys">
                            <fa icon="upload"></fa>
                            {{ $t('keys.button3') }}
                        </button>
                        <SaveAccountModal ref="account_modal"></SaveAccountModal>
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
import { Vue, Component, Prop } from 'vue-property-decorator'
import MyKeys from '@/components/wallet/manage/MyKeys.vue'
import ImportKeys from '@/components/modals/ImportKeys.vue'
import ExportKeys from '@/components/modals/ExportKeys.vue'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal.vue'

import { WalletNameType } from '@/js/wallets/types'
import { iUserAccountEncrypted } from '@/store/types'

@Component({
    name: 'manage',
    components: {
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
    }

    get accountIndex() {
        return this.$store.getters['Accounts/accountIndex']
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

    get canEncryptWallet() {
        return ['mnemonic', 'singleton'].includes(this.walletType)
    }

    get existsInLocalStorage() {
        return this.$store.state.Accounts.isSavedLocally
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
@use '../../main';

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
