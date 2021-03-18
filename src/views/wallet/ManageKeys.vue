<template>
    <div>
        <div>
            <div class="card_body">
                <header>
                    <h1>{{ $t('keys.title') }}</h1>
                    <div class="button_container" v-if="canEncryptWallet">
                        <button
                            v-if="hasVolatile"
                            @click="openRememberKeys"
                            class="remember_keys ava_button_secondary"
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
                        <RememberKeysModal ref="remember_modal"></RememberKeysModal>
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
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import RememberKeysModal from '@/components/modals/RememberWallet/RememberKeysModal.vue'
import { WalletNameType } from '@/store/types'

@Component({
    components: {
        MyKeys,
        ImportKeys,
        ExportKeys,
        RememberKeysModal,
    },
})
export default class ManageKeys extends Vue {
    importKeys() {
        // @ts-ignore
        this.$refs.import.open()
    }

    exportKeys() {
        // @ts-ignore
        this.$refs.export.open()
    }

    openRememberKeys() {
        // @ts-ignore
        this.$refs.remember_modal.open()
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

    get allWallets(): AvaHdWallet[] {
        return this.$store.state.wallets
    }

    get warnUpdateKeyfile() {
        return this.$store.state.warnUpdateKeyfile
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

h1 {
    font-weight: lighter;
}

.remember_keys {
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
