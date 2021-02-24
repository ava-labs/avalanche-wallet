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
import { LedgerWallet, MIN_EVM_SUPPORT_V } from '@/js/wallets/LedgerWallet'
import AppAvax from '@obsidiansystems/hw-app-avalanche'
import Eth from '@ledgerhq/hw-app-eth'
import { AVA_ACCOUNT_PATH, LEDGER_ETH_ACCOUNT_PATH } from '@/js/wallets/AvaHdWallet'

export const LEDGER_EXCHANGE_TIMEOUT = 90_000

export default {
    components: {
        Spinner,
        LedgerBlock,
    },
    data() {
        return {
            isLoading: false,
            config: undefined,
        }
    },
    destroyed() {
        this.$store.commit('Ledger/closeModal')
    },
    methods: {
        async submit() {
            try {
                let transport = await TransportU2F.create()
                transport.setExchangeTimeout(LEDGER_EXCHANGE_TIMEOUT)
                let app = new AppAvax(transport, 'w0w')
                let eth = new Eth(transport, 'w0w')
                // Wait for app config
                await this.waitForConfig(app)

                // Close the initial prompt modal if exists
                this.$store.commit('Ledger/setIsUpgradeRequired', false)
                this.isLoading = true

                let title, messages
                title = 'Provide Public Keys'
                messages = [
                    {
                        title: 'Derivation Path',
                        value: AVA_ACCOUNT_PATH,
                    },
                    {
                        title: 'Derivation Path',
                        value: LEDGER_ETH_ACCOUNT_PATH,
                    },
                ]

                this.$store.commit('Ledger/openModal', {
                    title,
                    messages,
                })

                let wallet = await LedgerWallet.fromApp(app, eth, this.config)
                try {
                    await this.$store.dispatch('accessWalletLedger', wallet)
                    this.onsuccess()
                } catch (e) {
                    this.onerror(e)
                }
            } catch (e) {
                console.log(e)
                this.onerror(e)
            }
        },
        async waitForConfig(app) {
            // Config is found immediately if the device is connected and the app is open.
            // If no config was found that means user has not opened the Avalanche app.
            setTimeout(() => {
                if (this.config) return
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
            }, 1000)

            this.config = await app.getAppConfiguration()
        },
        onsuccess() {
            this.isLoading = false
            this.config = undefined
            this.$store.commit('Ledger/closeModal')
        },
        onerror(err) {
            this.isLoading = false
            this.config = undefined
            this.$store.commit('Ledger/closeModal')
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
    color: inherit;
}

.spinner::v-deep p {
    color: inherit;
}
</style>
