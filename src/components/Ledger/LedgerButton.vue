<template>
    <button class="ava_button" @click="submit">
        <template v-if="!isLoading">Ledger</template>
        <Spinner v-else class="spinner"></Spinner>
    </button>
</template>
<script>
import TransportU2F from '@ledgerhq/hw-transport-u2f'
import Spinner from '@/components/misc/Spinner.vue'
import LedgerBlock from '@/components/modals/LedgerBlock'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import AppAvax from '@obsidiansystems/hw-app-avalanche'
import { AVA_ACCOUNT_PATH } from '@/js/wallets/AvaHdWallet'

export default {
    components: {
        Spinner,
        LedgerBlock,
    },
    data() {
        return {
            isLoading: false,
        }
    },
    watch: {
        isLoading(val) {
            if (val) {
                this.$store.commit('Ledger/openModal', {
                    title: 'Get extended public key',
                    info: AVA_ACCOUNT_PATH,
                })
            } else {
                this.$store.commit('Ledger/closeModal')
            }
        },
    },
    destroyed() {
        this.$store.commit('Ledger/closeModal')
    },
    methods: {
        async submit() {
            this.isLoading = true

            try {
                let transport = await TransportU2F.create()
                let app = new AppAvax(transport)
                let config = await app.getAppConfiguration()
                let wallet = await LedgerWallet.fromApp(app, config)
                try {
                    await this.$store.dispatch('accessWalletLedger', wallet)
                    this.onsuccess()
                } catch (e) {
                    this.onerror(e)
                }
            } catch (e) {
                this.onerror(e)
            }
        },
        onsuccess() {
            this.isLoading = false
        },
        onerror(err) {
            this.isLoading = false
            console.error(err)

            this.$store.dispatch('Notifications/add', {
                type: 'error',
                title: 'Ledger Access Failed',
                message: 'Failed to get public key from ledger device.',
            })
        },
    },
}
</script>
<style scoped lang="scss">
.spinner {
    width: 100% !important;
    color: var(--bg) !important;
}
</style>
