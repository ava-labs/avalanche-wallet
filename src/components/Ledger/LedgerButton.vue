<template>
    <button class="button_primary" @click="submit">
        <template v-if="!isLoading">
            Ledger
            <ImageDayNight
                day="/img/access_icons/day/ledger.svg"
                night="/img/access_icons/night/ledger.svg"
                class="ledger_img"
            ></ImageDayNight>
        </template>
        <Spinner v-else class="spinner"></Spinner>
    </button>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Vue } from 'vue-property-decorator'
// @ts-ignore
import TransportU2F from '@ledgerhq/hw-transport-u2f'
//@ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
//@ts-ignore
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
// @ts-ignore
import Eth from '@ledgerhq/hw-app-eth'
// @ts-ignore
import AppAvax from '@obsidiansystems/hw-app-avalanche'
import Spinner from '@/components/misc/Spinner.vue'
import { LedgerWallet, MIN_EVM_SUPPORT_V } from '@/js/wallets/LedgerWallet'
import { AVA_ACCOUNT_PATH, LEDGER_ETH_ACCOUNT_PATH } from '@/js/wallets/MnemonicWallet'
import { ILedgerAppConfig } from '@/store/types'
import { LEDGER_EXCHANGE_TIMEOUT } from '@/store/modules/ledger/types'
import ImageDayNight from '@/components/misc/ImageDayNight.vue'

@Component({
    components: {
        ImageDayNight,
        Spinner,
    },
})
export default class LedgerButton extends Vue {
    isLoading: boolean = false
    config?: ILedgerAppConfig = undefined

    destroyed() {
        this.$store.commit('Ledger/closeModal')
    }

    async getTransport() {
        let transport

        try {
            transport = await TransportWebHID.create()
            return transport
        } catch (e) {
            console.log('Web HID not supported.')
        }

        //@ts-ignore
        if (window.USB) {
            transport = await TransportWebUSB.create()
        } else {
            transport = await TransportU2F.create()
        }
        return transport
    }

    async submit() {
        try {
            let transport = await this.getTransport()
            transport.setExchangeTimeout(LEDGER_EXCHANGE_TIMEOUT)

            let app = new AppAvax(transport, 'w0w')
            let eth = new Eth(transport, 'w0w')

            // Wait for app config
            await this.waitForConfig(app)

            // Close the initial prompt modal if exists
            this.$store.commit('Ledger/setIsUpgradeRequired', false)
            this.isLoading = true

            if (!this.config) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                this.isLoading = false
                throw new Error('')
            }

            if (this.config.version < MIN_EVM_SUPPORT_V) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                this.isLoading = false
                return
            }

            let title = 'Provide Public Keys'
            let messages = [
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

            let wallet = await LedgerWallet.fromApp(
                app,
                eth,
                (this.config as unknown) as ILedgerAppConfig
            )
            try {
                await this.loadWallet(wallet)
                this.onsuccess()
            } catch (e) {
                this.onerror(e)
            }
        } catch (e) {
            this.onerror(e)
        }
    }

    async waitForConfig(app: AppAvax) {
        // Config is found immediately if the device is connected and the app is open.
        // If no config was found that means user has not opened the Avalanche app.
        setTimeout(() => {
            if (this.config) return
            this.$store.commit('Ledger/setIsUpgradeRequired', true)
        }, 1000)

        this.config = await app.getAppConfiguration()
    }

    async loadWallet(wallet: LedgerWallet) {
        this.showWalletLoading()
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                this.$store
                    .dispatch('accessWalletLedger', wallet)
                    .then(() => {
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }, 1000)
        })
    }

    showWalletLoading() {
        this.$store.commit('Ledger/closeModal')
        this.$store.commit('Ledger/setIsWalletLoading', true)
    }
    onsuccess() {
        this.$store.commit('Ledger/setIsWalletLoading', false)
        this.isLoading = false
        this.config = undefined
    }
    onerror(err: any) {
        this.isLoading = false
        this.config = undefined
        this.$store.commit('Ledger/closeModal')
        console.error(err)

        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Ledger Access Failed',
            message: 'Failed to get public key from ledger device.',
        })
    }
}
</script>
<style scoped lang="scss">
.spinner {
    width: 100% !important;
    color: inherit;
}

.ledger_img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.spinner::v-deep p {
    color: inherit;
}
</style>
