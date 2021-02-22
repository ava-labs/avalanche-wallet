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
                let app = new AppAvax(transport)
                // Wait for app config
                await this.waitForConfig(app)
                console.log(this.config)

                // Close the initial prompt modal if exists
                this.$store.commit('Ledger/closeModal')
                this.isLoading = true

                // Otherwise timer does not reset
                await setTimeout(() => null, 10)

                let eth, title, messages
                // TODO: enable when we want users upgrading after ledger fixes a few issues
                // let versionCheck = config.version >= MIN_EVM_SUPPORT_V
                let versionCheck = false
                if (versionCheck) {
                    eth = new Eth(transport, 'Avalanche')
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
                } else {
                    title = 'Provide Public Key'
                    messages = [
                        {
                            title: 'Derivation Path',
                            value: AVA_ACCOUNT_PATH,
                        },
                    ]
                }

                this.$store.commit('Ledger/openModal', {
                    title,
                    messages,
                })

                let wallet = await LedgerWallet.fromApp(app, eth, versionCheck, this.config)
                try {
                    await this.$store.dispatch('accessWalletLedger', wallet)
                    this.onsuccess()
                    // TODO: enable when we want users upgrading after ledger fixes a few issues
                    // this.$store.commit('Ledger/setIsUpgradeRecommended', config.version < MIN_EVM_SUPPORT_V)
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
                this.$store.commit('Ledger/openModal', {
                    title: 'Open the Avalanche app on your Ledger Device',
                    messages: [],
                    isPrompt: true,
                })
            }, 1000)

            this.config = await app.getAppConfiguration()
        },
        onsuccess() {
            this.isLoading = false
            this.$store.commit('Ledger/closeModal')
        },
        onerror(err) {
            this.isLoading = false
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
