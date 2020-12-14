<template>
    <modal ref="modal" :title="$t('modal.print.title')" class="print_modal">
        <div class="qr_body">
            <img
                ref="bg"
                src="@/assets/paper_wallet/bg.png"
                :style="{
                    display: 'none',
                    height: `${600}px`,
                    width: `${600 * aspectRatio}px`,
                }"
            />
            <canvas
                class="pdf_preview"
                ref="pdf"
                :style="{
                    height: `${600}px`,
                    width: `${600 * aspectRatio}px`,
                }"
            ></canvas>
            <v-btn depressed block @click="print">{{
                $t('modal.print.submit')
            }}</v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'

import Modal from '../Modal.vue'

import { KeyPair as AVMKeyPair } from 'avalanche/dist/apis/avm'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'

import QRCode from 'qrcode'
import printjs from 'print-js'

const PDF_W = 8.5
const PDF_H = 11
const PDF_ASPECT_RATIO = PDF_W / PDF_H

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

    open() {
        let modal = this.$refs.modal
        // @ts-ignore
        modal.open()

        setTimeout(() => {
            this.initBg()
        }, 200)
    }

    get address() {
        try {
            let wallet: AvaHdWallet = this.$store.state.activeWallet
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

    get mnemonic(): string {
        let wallet: AvaHdWallet = this.$store.state.activeWallet
        if (!wallet) return '-'

        return wallet.mnemonic || '-'
    }

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

        cont.font = '8px Helvetica'
        cont.fillText(addr1, 352, 140, 120)
        cont.fillText(addr2, 352, 150, 120)
        cont.drawImage(this.qrImg as HTMLImageElement, 352, 10)

        // Bottom Address
        cont.font = '10px Helvetica'
        cont.fillText(addr, 40, 380)
        cont.drawImage(this.qrImg as HTMLImageElement, 352, 335, 90, 90)

        // Mnemonic
        let mnemonicWords: string[] = this.mnemonic.split(' ')
        let row1 = mnemonicWords.slice(0, 8).join(' ')
        let row2 = mnemonicWords.slice(8, 16).join(' ')
        let row3 = mnemonicWords.slice(16).join(' ')
        cont.fillText(row1, 40, 490)
        cont.fillText(row2, 40, 505)
        cont.fillText(row3, 40, 520)
        cont.drawImage(this.mnemonicImg as HTMLImageElement, 352, 445)
    }

    @Watch('address')
    @Watch('mnemonic')
    buildQr() {
        let parent = this
        QRCode.toDataURL(
            this.address,
            {
                width: 100,
            },
            function (err, url) {
                var img = new Image()
                img.src = url
                parent.qrImg = img
            }
        )

        QRCode.toDataURL(
            this.mnemonic,
            {
                width: 90,
            },
            function (err, url) {
                var img = new Image()
                img.src = url
                parent.mnemonicImg = img
            }
        )
    }

    mounted() {
        this.buildQr()
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
.print_modal >>> .modal_body {
    width: auto !important;
}
.qr_body {
    padding: 30px;
}

.qr_body p {
    word-break: break-all;
}
.pdf_preview {
    width: 420px;
    height: 320px;
    border: 1px solid #ddd;
}
</style>
