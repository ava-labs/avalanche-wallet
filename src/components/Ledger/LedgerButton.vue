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
import Eth from '@ledgerhq/hw-app-eth'
import { AVA_ACCOUNT_PATH, LEDGER_ETH_ACCOUNT_PATH } from '@/js/wallets/AvaHdWallet'

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
                    title: 'Provide Public Keys',
                    messages: [],
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
                const MIN_V_FOR_EVM_SUPPORT = '0.4.0'
                // {version: "0.4.0", commit: "TEST*", name: "Avalanche"}
                // Check for C Chain support ("0.4.0")
                // if (config.version < MIN_V) {
                //     this.$store.commit('Ledger/setIsUpgradeRequired', true)
                //     console.error(
                //         `Avalanche Ledger App is v${config.version}. Should be at least v${MIN_V}`
                //     )
                //     this.isLoading = false
                //     return
                // }
                let eth
                if (config >= MIN_V_FOR_EVM_SUPPORT) {
                    eth = new Eth(transport, 'Avalanche')
                }

                let wallet = await LedgerWallet.fromApp(app, eth, config)
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
    color: inherit;
}

.spinner::v-deep p {
    color: inherit;
}
</style>
