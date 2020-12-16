<template>
    <div class="addr_card">
        <q-r-modal ref="qr_modal"></q-r-modal>
        <paper-wallet
            ref="print_modal"
            v-if="walletType === 'mnemonic'"
        ></paper-wallet>
        <p class="addr_info">{{ $t('top.address.desc') }}</p>
        <div class="bottom">
            <div>
                <canvas ref="qr"></canvas>
            </div>
            <div class="bottom_rest">
                <p class="subtitle">{{ $t('top.address.derived') }}</p>
                <p
                    class="addr_text"
                    data-cy="wallet_address"
                    v-if="chainNow === 'X'"
                >
                    {{ address }}
                </p>
                <p
                    class="addr_text"
                    data-cy="wallet_address"
                    v-else-if="chainNow === 'P'"
                >
                    {{ addressPVM }}
                </p>
                <p
                    class="addr_text"
                    data-cy="wallet_address"
                    v-else-if="chainNow === 'C'"
                >
                    {{ addressEVM }}
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
                        <CopyText
                            :tooltip="$t('top.hover3')"
                            :value="address"
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
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'

import ChainSelect from '@/components/wallet/TopCards/AddressCard/ChainSelect.vue'
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
    chainNow: string = 'X'

    $refs!: {
        qr_modal: QRModal
        print_modal: PaperWallet
        qr: HTMLCanvasElement
    }

    @Watch('address')
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

    get isDayTheme(): boolean {
        //@ts-ignore
        return this.$root.theme === 'day'
    }

    get walletType(): WalletNameType {
        let wallet: WalletType = this.$store.state.activeWallet
        return wallet.type
    }

    get address() {
        let wallet: WalletType = this.$store.state.activeWallet
        if (!wallet) {
            return '-'
        }
        return wallet.getCurrentAddress()
    }

    get addressPVM() {
        let wallet: WalletType = this.$store.state.activeWallet
        if (!wallet) {
            return '-'
        }

        return wallet.getCurrentPlatformAddress()
    }

    get addressEVM() {
        let wallet: WalletType = this.$store.state.activeWallet
        if (!wallet) {
            return '-'
        }

        return `C-0x` + wallet.getEvmAddress()
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
            this.address,
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

    .addr_info {
        display: none;
    }
    canvas {
        display: block;
        margin: 0px auto;
    }

    .buts {
        margin: 6px 0;
        justify-content: space-evenly;

        > * {
            margin: 0;
        }
    }
}

@include main.mobile-device {
    .addr_info {
        display: none;
    }
}
</style>
