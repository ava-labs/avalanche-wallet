<template>
    <div class="addr_card">
        <q-r-modal ref="qr_modal" :address="activeAddress"></q-r-modal>
        <paper-wallet ref="print_modal" v-if="walletType === 'mnemonic'"></paper-wallet>
        <p class="addr_info">{{ addressMsg }}</p>
        <div class="bottom">
            <div>
                <canvas ref="qr"></canvas>
            </div>
            <div class="bottom_rest">
                <p class="subtitle">{{ addressLabel }}</p>

                <p class="addr_text" data-cy="wallet_address">
                    {{ activeAddress }}
                </p>
                <div style="display: flex; margin-top: 10px">
                    <ChainSelect v-model="chainNow"></ChainSelect>
                    <div class="buts">
                        <button
                            :tooltip="$t('top.hover1')"
                            @click="viewQRModal"
                            class="qr_but"
                        ></button>
                        <button
                            v-if="walletType === 'mnemonic'"
                            :tooltip="$t('top.hover2')"
                            @click="viewPrintModal"
                            class="print_but"
                        ></button>
                        <button
                            v-if="walletType === 'ledger'"
                            :tooltip="$t('create.verify')"
                            @click="verifyLedgerAddress"
                            class="ledger_but"
                        ></button>
                        <CopyText
                            :tooltip="$t('top.hover3')"
                            :value="activeAddress"
                            class="copy_but"
                        ></CopyText>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import CopyText from '@/components/misc/CopyText.vue'
import QRModal from '@/components/modals/QRModal.vue'
import PaperWallet from '@/components/modals/PaperWallet/PaperWallet.vue'
import QRCode from 'qrcode'
import { KeyPair as AVMKeyPair } from 'avalanche/dist/apis/avm'
import { WalletNameType, WalletType } from '@/store/types'
import AvaHdWallet, { AVA_ACCOUNT_PATH } from '@/js/wallets/AvaHdWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'

import ChainSelect from '@/components/wallet/TopCards/AddressCard/ChainSelect.vue'
import { ChainIdType } from '@/constants'
import { ava } from '@/AVA'
import { getPreferredHRP } from 'avalanche/dist/utils'
@Component({
    components: {
        CopyText,
        PaperWallet,
        QRModal,
        ChainSelect,
    },
})
export default class AddressCard extends Vue {
    colorLight: string = '#FFF'
    colorDark: string = '#242729'
    chainNow: ChainIdType = 'X'

    $refs!: {
        qr_modal: QRModal
        print_modal: PaperWallet
        qr: HTMLCanvasElement
    }

    @Watch('activeAddress')
    onaddrchange() {
        this.updateQR()
    }

    @Watch('$root.theme', { immediate: true })
    onthemechange(val: string) {
        if (val === 'night') {
            this.colorDark = '#E5E5E5'
            this.colorLight = '#242729'
        } else {
            this.colorDark = '#242729'
            this.colorLight = '#FFF'
        }
        this.updateQR()
    }

    get addressLabel(): string {
        switch (this.chainNow) {
            default:
                return this.$t('top.address.title_x') as string
            case 'P':
                return this.$t('top.address.title_p') as string
            case 'C':
                return this.$t('top.address.title_c') as string
        }
    }

    get addressMsg(): string {
        switch (this.chainNow) {
            default:
                return this.$t('top.address.desc_x') as string
            case 'P':
                return this.$t('top.address.desc_p') as string
            case 'C':
                return this.$t('top.address.desc_c') as string
        }
    }
    get isDayTheme(): boolean {
        //@ts-ignore
        return this.$root.theme === 'day'
    }

    get walletType(): WalletNameType {
        let wallet = this.activeWallet
        if (!wallet) return 'mnemonic'
        return wallet.type
    }

    get activeWallet(): WalletType | null {
        return this.$store.state.activeWallet
    }
    get address() {
        let wallet = this.activeWallet
        if (!wallet) {
            return '-'
        }
        return wallet.getCurrentAddress()
    }

    get addressPVM() {
        let wallet = this.activeWallet
        if (!wallet) {
            return '-'
        }

        return wallet.getCurrentPlatformAddress()
    }

    get addressEVM() {
        let wallet = this.activeWallet
        if (!wallet) {
            return '-'
        }

        return '0x' + wallet.getEvmAddress()
    }

    get activeAddress(): string {
        switch (this.chainNow) {
            case 'X':
                return this.address
            case 'P':
                return this.addressPVM
            case 'C':
                return this.addressEVM
        }
        return this.address
    }

    get activeIdx(): number {
        const wallet = this.activeWallet as AvaHdWallet
        const walletType = wallet.type

        if (walletType === 'singleton') return 0

        switch (this.chainNow) {
            case 'X':
                return wallet.getExternalActiveIndex()
            case 'P':
                return wallet.getPlatformActiveIndex()
            default:
                return 0
        }
    }

    viewQRModal() {
        // @ts-ignore
        this.$refs.qr_modal.open()
    }
    viewPrintModal() {
        let modal = this.$refs.print_modal
        // @ts-ignore
        modal.open()
    }
    updateQR() {
        let canvas = this.$refs.qr as HTMLCanvasElement
        if (!canvas) return

        let size = canvas.clientWidth
        QRCode.toCanvas(
            canvas,
            this.activeAddress,
            {
                scale: 6,
                color: {
                    light: this.colorLight,
                    dark: this.colorDark,
                },
                width: size,
                // height: size,
            },
            function (error: any) {
                if (error) console.error(error)
            }
        )
    }

    async verifyLedgerAddress() {
        const wallet = this.activeWallet as LedgerWallet

        let networkId = ava.getNetworkID()
        let hrp = getPreferredHRP(networkId)

        wallet.app.getWalletAddress(`${AVA_ACCOUNT_PATH}/0/${this.activeIdx}`, hrp)
    }

    mounted() {
        this.updateQR()
    }
}
</script>
<style scoped lang="scss">
@use '../../../../main';

.addr_card {
    display: flex;
    flex-direction: column;
}
.buts {
    width: 100%;
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: var(--primary-color-light);

    > * {
        font-size: 16px;
        margin: 0px 18px;
        margin-right: 0px;
        position: relative;
        outline: none;
        width: 18px;
        height: 18px;
        opacity: 0.6;

        background-size: contain;
        background-position: center;
        &:hover {
            opacity: 1;
        }
    }
}

.qr_but {
    background-image: url('/img/qr_icon.png');
}
.print_but {
    background-image: url('/img/faucet_icon.png');
}
.ledger_but {
    background-image: url('/img/ledger_icon.png');
}
.copy_but {
    color: var(--primary-color);
}

.mainnet_but {
    background-image: url('/img/modal_icons/mainnet_addr.svg');
}

@include main.night-mode {
    .qr_but {
        background-image: url('/img/qr_icon_night.svg');
    }
    .print_but {
        background-image: url('/img/print_icon_night.svg');
    }
    .ledger_but {
        background-image: url('/img/ledger_night.svg');
    }

    .mainnet_but {
        background-image: url('/img/modal_icons/mainnet_addr_night.svg');
    }
}

.addr_info {
    background-color: var(--bg-light);
    font-size: 13px;
    font-weight: bold;
    text-align: center;
    padding: 12px 16px;
    margin-bottom: 12px !important;
}

$qr_width: 110px;

.bottom {
    display: grid;
    grid-template-columns: $qr_width 1fr;
    column-gap: 14px;

    canvas {
        width: $qr_width;
        height: $qr_width;
        background-color: transparent;
    }

    .bottom_rest {
        padding-top: 4px;
        display: flex;
        flex-direction: column;
    }
}

.sub {
    margin: 0px 10px !important;
    text-align: center;
    font-size: 0.7rem;
    background-color: main.$secondary-color;
    color: #fff;
    padding: 3px 6px;
    border-radius: 3px;
}

.subtitle {
    font-size: 0.7rem;
    margin-top: 3px !important;
    color: var(--primary-color-light);
}

.addr_text {
    font-size: 15px;
    word-break: break-all;
    color: var(--primary-color);
    flex-grow: 1;
}

@include main.medium-device {
    //.bottom{
    //    display: block;
    //}
    .bottom_rest {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .addr_info {
        display: none;
    }
    canvas {
        display: block;
        margin: 0px auto;
    }

    .buts {
        //margin: 6px 0;
        justify-content: space-evenly;

        > * {
            margin: 0;
        }
    }

    .addr_text {
        font-size: 13px;
    }
}

@include main.mobile-device {
    .addr_info {
        display: none;
    }
}
</style>
