<template>
    <button class="button_primary" @click="submit">
        <template v-if="!isLoading">
            SecuX
            <ImageDayNight
                day="/img/access_icons/day/secux.svg"
                night="/img/access_icons/night/secux.svg"
                class="secux_img"
            ></ImageDayNight>
        </template>
        <Spinner v-else class="spinner"></Spinner>
    </button>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
// @ts-ignore
import { SecuxWebUSB } from '@secux/transport-webusb'
import { SecuxETH } from '@secux/app-eth'
import {SecuxDevice } from '@secux/protocol-device'

//@ts-ignore
import AppAvax from '@secux/hw-app-avalanche'
import Spinner from '@/components/misc/Spinner.vue'
import { SecuXWallet, MIN_MCU_FW_SUPPORT_V } from '@/js/wallets/SecuXWallet'
import { AVA_ACCOUNT_PATH, SECUX_ETH_ACCOUNT_PATH } from '@/js/wallets/MnemonicWallet'
import { ISecuXConfig } from '@/store/types'
import ImageDayNight from '@/components/misc/ImageDayNight.vue'

@Component({
    components: {
        ImageDayNight,
        Spinner,
    },
})
export default class SecuXButton extends Vue {
    isLoading: boolean = false
    destroyed() {
        this.$store.commit('SecuX/closeModal')
    }

    async getTransport() {
        let transport = await SecuxWebUSB.Create(
            () => console.log('connected'),
            async () => {
                console.log('disconnected')
                await this.$store.dispatch('logout')
            }
        )
        return transport
    }

    async submit() {
        try {
            let transport = await this.getTransport()
            await transport.Connect()
            console.log(SecuxDevice)
            this.config = await SecuxDevice.getVersion(transport)
            let app = new AppAvax(transport)

            // Close the initial prompt modal if exists
            this.$store.commit('SecuX/setIsUpgradeRequired', false)
            this.isLoading = true
            if (!this.config) {
                this.$store.commit('SecuX/setIsUpgradeRequired', true)
                this.isLoading = false
                throw new Error('')
            }

            if (this.config.mcuFwVersion < MIN_MCU_FW_SUPPORT_V) {
                this.$store.commit('SecuX/setIsUpgradeRequired', true)
                throw new Error('')
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
                    value: SECUX_ETH_ACCOUNT_PATH,
                },
            ]

            this.$store.commit('SecuX/openModal', {
                title,
                messages,
            })

            let wallet = await SecuXWallet.fromApp(
                app,
                SecuxETH,
                transport,
                (this.config as unknown) as ISecuXConfig
            )
            try {
                await this.loadWallet(wallet)
                this.onsuccess()
            } catch (e) {
                console.log(e) // this.onerror(e)
            }
        } catch (e) {
            this.onerror(e)
        }
    }

    // async waitForConfig(app: AppAvax) {
    //     // Config is found immediately if the device is connected and the app is open.
    //     // If no config was found that means user has not opened the Avalanche app.
    //     setTimeout(() => {
    //         if (this.config) return
    //         this.$store.commit('SecuX/setIsUpgradeRequired', true)
    //     }, 1000)

    //     this.config = await app.getAppConfiguration()
    // }

    async loadWallet(wallet: SecuXWallet) {
        this.showWalletLoading()
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.$store
                    .dispatch('accessWalletSecuX', wallet)
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
        this.$store.commit('SecuX/closeModal')
        this.$store.commit('SecuX/setIsWalletLoading', true)
    }
    onsuccess() {
        this.$store.commit('SecuX/setIsWalletLoading', false)
        this.isLoading = false
        this.config = undefined
    }
    onerror(err: any) {
        this.isLoading = false
        this.config = undefined
        this.$store.commit('SecuX/closeModal')
        console.error(err)

        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'SecuX Access Failed',
            message: 'Failed to get public key from SecuX device. Device firmware upgrade required',
        })
    }
}
</script>
<style scoped lang="scss">
.spinner {
    width: 100% !important;
    color: inherit;
}

.secux_img {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.spinner::v-deep p {
    color: inherit;
}
</style>
