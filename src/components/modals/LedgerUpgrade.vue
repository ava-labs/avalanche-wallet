<template>
    <modal ref="modal" :title="$t('modal.ledger_upgrade.title')" @beforeClose="beforeClose">
        <div class="ledger_block">
            <p style="margin-bottom: 14px !important; font-size: 16px" v-if="config">
                <b>Min Version Required: v{{ minV }}.</b>
            </p>
            <p style="margin-bottom: 14px !important; font-size: 16px">
                {{ $t('modal.ledger_upgrade.desc') }}
            </p>
            <div>
                <a
                    href="https://docs.avax.network/build/tutorials/platform/setup-your-ledger-nano-s-with-avalanche"
                    target="_blank"
                >
                    {{ $t('modal.ledger_upgrade.upgrade') }}
                </a>
            </div>
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
