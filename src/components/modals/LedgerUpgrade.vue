<template>
    <modal ref="modal" :title="$t('modal.ledger_upgrade.title')" @beforeClose="beforeClose">
        <div class="ledger_block">
            <ol>
                <li>Connect the ledger device to your computer.</li>
                <li>Enter your PIN and access your device.</li>
                <li>
                    Ensure you have installed the
                    <b>Avalanche App v0.5.3</b>
                    and open it on your device.
                </li>
            </ol>
            <p style="margin-top: 12px !important">
                <small>
                    If you do not have the Avalanche app on your ledger, please add it through the
                    <a href="https://www.ledger.com/ledger-live/download" target="_blank">
                        Ledger Live
                    </a>
                    app manager. The minimum version required to use the app is version 0.5.3, more
                    instructions can be found
                    <a
                        target="_blank"
                        href="https://docs.avax.network/build/tutorials/platform/setup-your-ledger-nano-s-with-avalanche"
                    >
                        here
                    </a>
                    .
                </small>
            </p>
        </div>
    </modal>
</template>
<script lang="ts">
import { LedgerWallet, MIN_EVM_SUPPORT_V } from '@/js/wallets/LedgerWallet'
import { WalletType } from '@/js/wallets/types'

import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'

import Modal from './Modal.vue'

@Component({
    components: {
        Modal,
    },
})
export default class LedgerUpgrade extends Vue {
    $refs!: {
        modal: Modal
    }

    open() {
        this.$refs.modal.open()
    }

    close() {
        this.$refs.modal.close()
    }

    beforeClose() {
        this.$store.commit('Ledger/setIsUpgradeRequired', false)
    }

    destroyed() {
        this.$store.commit('Ledger/setIsUpgradeRequired', false)
    }

    get minV() {
        return MIN_EVM_SUPPORT_V
    }

    get isActive() {
        return this.$store.state.Ledger.isUpgradeRequired
    }

    get wallet() {
        return this.$store.state.activeWallet as WalletType
    }

    get config() {
        if (!this.wallet) return {}
        return (this.wallet as LedgerWallet).config
    }

    @Watch('isActive', { immediate: true })
    onActive(val: boolean): void {
        if (!this.$refs.modal) return
        if (val) {
            this.open()
        } else {
            this.close()
        }
    }
}
</script>
<style scoped lang="scss">
.ledger_block {
    padding: 30px;
    max-width: 450px;
}

.ledger_block > div {
    text-align: center;
}
</style>
