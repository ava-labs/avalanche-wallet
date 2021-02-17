<template>
    <modal ref="modal" :title="$t('modal.ledger_upgrade.title')" @beforeClose="beforeClose">
        <div class="ledger_block">
            <p style="margin-bottom: 14px !important; font-size: 16px">
                <b>Current Avalanche App: v{{ config.version }}</b>
            </p>
            <p style="margin-bottom: 14px !important; font-size: 16px">
                To support C-chain transfers and balance, please consider upgrading to v0.4.0.
            </p>
            <div>
                <a
                    href="https://medium.com/avalancheavax/how-to-set-up-your-ledger-nano-s-with-avalanche-4e5d385410d4"
                    target="_blank"
                >
                    {{ $t('modal.ledger_upgrade.submit') }}
                </a>
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { WalletType } from '@/store/types'
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
        this.$store.commit('Ledger/setIsUpgradeRecommended', false)
    }

    destroyed() {
        this.$store.commit('Ledger/setIsUpgradeRecommended', false)
    }

    get isActive() {
        return this.$store.state.Ledger.isUpgradeRecommended
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
