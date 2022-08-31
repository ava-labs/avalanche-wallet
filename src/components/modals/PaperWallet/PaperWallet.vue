<template>
    <modal ref="modal" :title="$t('modal.print.title')" class="print_modal">
        <div class="qr_body" ref="qr_body">
            <img
                ref="bg"
                src="@/assets/paper_wallet/bg.png"
                :style="{
                    display: 'none',
                    height: `${height}px`,
                    width: `100%`,
                    // width: '100%',
                    // paddingTop: `${100 / aspectRatio}%`,
                }"
            />
            <canvas
                class="pdf_preview"
                ref="pdf"
                :style="{
                    width: `100%`,
                    height: `${height}px`,
                    // width: '100%',
                    // paddingTop: `${100 / aspectRatio}%`,
                }"
            ></canvas>
            <v-btn depressed block @click="print" class="print_btn">
                {{ $t('modal.print.submit') }}
            </v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'

import Modal from '../Modal.vue'

import MnemonicWallet from '@/js/wallets/MnemonicWallet'

import QRCode from 'qrcode'
import printjs from 'print-js'

const PDF_W = 8.5
const PDF_H = 11

// Contents of the pdf are set according to this value
const designWidth = 525 - 60
@Component({
    components: {
        Modal,
    },
})
export default class PaperWallet extends Vue {
    $refs!: {
        modal: Modal
        pdf: HTMLCanvasElement
        bg: HTMLImageElement
    }

    qrImg: HTMLImageElement | null = null
    mnemonicImg: HTMLImageElement | null = null

    @Prop() wallet!: MnemonicWallet
    // Height and Width of the img and canvas
    width = 100
    height = 100

    open() {
        let modal = this.$refs.modal
        // @ts-ignore
        modal.open()

        setTimeout(() => {
            this.setSizes()
        }, 200)

        setTimeout(() => {
            // this.setSizes()
            this.initBg()
        }, 500)
    }

    get address() {
        try {
            let wallet: MnemonicWallet = this.$store.state.activeWallet
            if (!wallet) return '-'

            let key = wallet.externalHelper.getKeyForIndex(0)
            if (!key) {
                return '-'
            }
            return key.getAddressString()
        } catch (e) {
            return '-'
        }
    }

    // get mnemonic(): string {
    //     let wallet: MnemonicWallet = this.$store.state.activeWallet
    //     if (!wallet) return '-'
    //
    //     return wallet.getMnemonic() || '-'
    // }

    get aspectRatio(): number {
        return PDF_W / PDF_H
    }

    initBg() {
        let canv: HTMLCanvasElement = this.$refs.pdf
        let cont = canv.getContext('2d') as CanvasRenderingContext2D
        let img = this.$refs.bg

        let w = canv.clientWidth
        let h = canv.clientHeight

        const sizeFactor = 3

        canv.width = w * sizeFactor
        canv.height = h * sizeFactor

        cont.scale(sizeFactor, sizeFactor)
        cont.drawImage(img, 0, 0, w, h)

        this.writeInfo()
    }

    writeInfo() {
        let canv: HTMLCanvasElement = this.$refs.pdf
        let cont = canv.getContext('2d') as CanvasRenderingContext2D

        // Top Address
        const wrapChar = 25
        let addr = this.address
        let addr1 = addr.substr(0, wrapChar)
        let addr2 = addr.substr(wrapChar)

        cont.font = `${this.designPxToReal(8)}px Helvetica`
        cont.fillText(
            addr1,
            this.designPxToReal(352),
            this.designPxToReal(140),
            this.designPxToReal(120)
        )
        cont.fillText(
            addr2,
            this.designPxToReal(352),
            this.designPxToReal(150),
            this.designPxToReal(120)
        )
        cont.drawImage(
            this.qrImg as HTMLImageElement,
            this.designPxToReal(352),
            this.designPxToReal(10),
            this.designPxToReal(100),
            this.designPxToReal(100)
        )

        // Bottom Address
        cont.font = `${this.designPxToReal(10)}px Helvetica`
        cont.fillText(addr, this.designPxToReal(40), this.designPxToReal(380))
        cont.drawImage(
            this.qrImg as HTMLImageElement,
            this.designPxToReal(352),
            this.designPxToReal(335),
            this.designPxToReal(90),
            this.designPxToReal(90)
        )

        // Mnemonic
        let mnemonicWords: string[] = this.wallet.getMnemonic().split(' ')
        let row1 = mnemonicWords.slice(0, 8).join(' ')
        let row2 = mnemonicWords.slice(8, 16).join(' ')
        let row3 = mnemonicWords.slice(16).join(' ')
        cont.fillText(row1, this.designPxToReal(40), this.designPxToReal(490))
        cont.fillText(row2, this.designPxToReal(40), this.designPxToReal(505))
        cont.fillText(row3, this.designPxToReal(40), this.designPxToReal(520))
        cont.drawImage(
            this.mnemonicImg as HTMLImageElement,
            this.designPxToReal(352),
            this.designPxToReal(445),
            this.designPxToReal(90),
            this.designPxToReal(90)
        )
    }

    @Watch('address')
    @Watch('mnemonic')
    buildQr() {
        let parent = this
        QRCode.toDataURL(
            this.address,
            {
                width: this.designPxToReal(100),
            },
            function (err, url) {
                var img = new Image()
                img.src = url
                parent.qrImg = img
            }
        )

        QRCode.toDataURL(
            this.wallet.getMnemonic(),
            {
                width: this.designPxToReal(90),
            },
            function (err, url) {
                var img = new Image()
                img.src = url
                parent.mnemonicImg = img
            }
        )
    }

    setSizes() {
        // Set height and width
        //@ts-ignore
        let contW = this.$refs['pdf'].clientWidth

        this.width = contW
        this.height = contW / this.aspectRatio
    }

    mounted() {
        this.buildQr()
    }

    designPxToReal(px: number) {
        return (this.width / designWidth) * px
    }

    print() {
        let canv: HTMLCanvasElement = this.$refs.pdf
        printjs({
            printable: canv.toDataURL(),
            type: 'image',
            imageStyle: 'width:100%; margin: 5px;',
            maxWidth: 2800,
            documentTitle: '',
        })
    }
}
</script>
<style scoped>
.qr_body {
    width: 525px;
    max-width: 100%;
    padding: 30px;
    margin: 0px auto;
}

.qr_body p {
    word-break: break-all;
}

.pdf_preview {
    /*width: 420px;*/
    /*max-width: 100%;*/
    /*height: 320px;*/
    border: 1px solid #ddd;
}

.print_btn {
    background-color: var(--secondary-color) !important;
}
</style>
