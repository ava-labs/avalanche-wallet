<template>
    <modal ref="modal" :title="$t('modal.print.title')" class="print_modal">
        <div class="qr_body">
            <canvas class="pdf_preview" ref="pdf" :style="{
                height: `${600}px`,
                width: `${600*aspectRatio}px`
            }"></canvas>
            <v-btn depressed block @click="print">{{$t('modal.print.submit')}}</v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Watch } from 'vue-property-decorator';

    // import triangles from './PaperWallet/triangles.png';
    import Modal from './Modal.vue';
    // import CopyText from "../misc/CopyText";
    import QRCode from 'qrcode'
    import jsPDF from 'jspdf';
    var pdfjsLib = require("pdfjs-dist");
    import printjs from 'print-js'
    import {AVMKeyPair} from "avalanche";

    const PDF_W = 8.5;
    const PDF_H = 11;
    const PDF_ASPECT_RATIO = PDF_W/PDF_H;
    const PADDING = 0.5;

    let pdfDoc:any = null;
    let pdfData = '';

    @Component({
        components: {
            Modal
        }
    })
    export default class PaperWallet extends Vue{
        $refs!:{
            modal: Modal
            pdf: HTMLCanvasElement
        };

        @Watch('address')
        onAddressChange() {
            this.refreshPDF();
        }

        open(){
            let modal = this.$refs.modal;
            // @ts-ignore
            modal.open();
        }

        print(){
            const pdfBlob = new Blob([pdfDoc.output('blob')], { type: "application/pdf" });
            const url = URL.createObjectURL(pdfBlob);
            printjs(url);
        }



        buildPDF(doc:any){
            if(!this.address) return;

            let posX = 0;
            let posY = 0;
            // BG
            // console.log(typeof triangles);
            // Yellow top
            doc.setFillColor("#EBE4FB");
            doc.rect(0, 0, PDF_W, 3, 'F');

            // Belons to _______
            posX = PADDING;
            posY = 2.5;

            doc.setFontSize(14);
            doc.setFontStyle('bold');
            doc.setTextColor('#000');
            doc.text("This address belongs to", posX, posY);
            doc.setFillColor("#000");
            doc.rect( posX+2.4, posY, 3, 0.02, 'F');


            // YELLOW QR
            posX = posX+5.6;
            posY = 0.2;
            doc.setFillColor("#000");
            doc.rect( posX, posY, 0.02, 2.5, 'F');
            posX += 0.2;


            QRCode.toDataURL(this.address, function (err, url) {
                doc.addImage(url, 'PNG', posX, posY, 1.8, 1.8);
            });
            doc.setTextColor('#000');
            doc.setFontSize(11)
            posY += 2.1;
            doc.text("My Address:", posX, posY);
            posY += 0.2
            doc.setFontStyle('normal');
            doc.text(this.address, posX, posY, {
                maxWidth: 1.8
            });



            // Triangle bg
            // doc.addImage(triangles,'PNG', 10, 10, 200, 200)



            // WARNING #################################
            posX = PADDING;
            posY += 1.5;
            doc.setFontSize(22);
            doc.setFontStyle('bold');
            doc.text("Always keep your Paper Wallet at a SAFE Place!", posX, posY, {
                maxWidth: (PDF_W - (PADDING*2))
            });

            // MY ADDRESS #################################

            posY += 0.9;


            let rectH = 2;
            let rectY = 4;

            doc.setFillColor("#EBE4FB");
            doc.rect(posX, posY, PDF_W-(PADDING*2), rectH, 'F');

            // Title
            posX += PADDING;
            posY += 0.7;
            doc.setFontSize(20);
            doc.setFontStyle('bold');
            doc.text("MY ADDRESS", posX, posY);
            // Address
            posY += 0.3;
            doc.setFontSize(12);
            doc.setFontStyle('normal');
            doc.text(this.address, posX,posY);
            // QR
            let qrW = 1.6;
            let qrH = 1.6;
            let qrX = PDF_W-PADDING - qrW - 0.2;
            let qrY = rectY+0.2;

            posX = PDF_W-PADDING - qrW - 0.2;
            posY -= 1 - 0.2;
            QRCode.toDataURL(this.address, function (err, url) {
                doc.addImage(url, 'PNG', posX, posY, qrW, qrH);
            });

            // MY PRIVATE KEY #################################

            posX = PADDING
            posY += 2;


            rectY += rectH+0.2;
            doc.setFillColor("#e4f1fb");
            doc.rect(posX, posY, PDF_W-(PADDING*2), rectH, 'F');

            // Title
            posX += PADDING;
            posY += 0.7;

            doc.setTextColor('#ff0000');
            doc.setFontSize(20);
            doc.setFontStyle('bold');
            doc.text("MY PRIVATE KEY", posX, posY);
            // Address
            posY += 0.3;
            doc.setTextColor('#000');
            doc.setFontSize(12);
            doc.setFontStyle('normal');
            doc.text(this.privateKey, posX,posY);
            // QR

            posX = PDF_W-PADDING - qrW - 0.2;
            posY -= 1 - 0.2;
            qrW = 1.6;
            qrH = 1.6;
            qrX = PDF_W-PADDING - qrW - 0.2;
            qrY = rectY+0.2;
            QRCode.toDataURL(this.privateKey, function (err, url) {
                doc.addImage(url, 'PNG', posX, posY, qrW, qrH);
            });
        }

        async refreshPDF() {
            let canvas = this.$refs.pdf as HTMLCanvasElement;
            let context = canvas.getContext('2d');


            pdfDoc = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            this.buildPDF(pdfDoc);


            pdfData = pdfDoc.output('dataurlstring', {
                filename: "avapaperwallet.pdf"
            });

            let pdf = await pdfjsLib.getDocument(pdfData).promise;

            const page = await pdf.getPage(1);

            let scale = 2;
            const viewport = page.getViewport({
                scale: scale
            });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;
        }






        get address(){
            let activeKey:AVMKeyPair|null = this.$store.getters.activeKey;
            if(!activeKey){
                return '-'
            }
            return activeKey.getAddressString();
        }

        get privateKey():string{
            return this.$store.state.activeWallet.getCurrentKey().getPrivateKeyString();
        }

        get aspectRatio():number{
            return PDF_W/PDF_H;
        }


        mounted() {
            this.refreshPDF();
        }
    }
    //
    // export default {
    //     components: {
    //         Modal,
    //         // CopyText
    //     },
    //     methods: {
    //         open(){
    //             this.$refs.modal.open();
    //         },
    //
    //         print(){
    //             const pdfBlob = new Blob([pdfDoc.output('blob')], { type: "application/pdf" });
    //             const url = URL.createObjectURL(pdfBlob);
    //             printjs(url);
    //         },
    //
    //         buildPDF(doc){
    //
    //             let posX = 0;
    //             let posY = 0;
    //             // BG
    //             console.log(typeof triangles);
    //             // Yellow top
    //             doc.setFillColor("#EBE4FB");
    //             doc.rect(0, 0, PDF_W, 3, 'F');
    //
    //             // Belons to _______
    //             posX = PADDING;
    //             posY = 2.5;
    //
    //             doc.setFontSize(14);
    //             doc.setFontStyle('bold');
    //             doc.setTextColor('#000');
    //             doc.text("This address belongs to", posX, posY);
    //             doc.setFillColor("#000");
    //             doc.rect( posX+2.4, posY, 3, 0.02, 'F');
    //
    //
    //             // YELLOW QR
    //             posX = posX+5.6;
    //             posY = 0.2;
    //             doc.setFillColor("#000");
    //             doc.rect( posX, posY, 0.02, 2.5, 'F');
    //             posX += 0.2
    //             QRCode.toDataURL(this.address, function (err, url) {
    //                 doc.addImage(url, 'PNG', posX, posY, 1.8, 1.8);
    //             });
    //             doc.setTextColor('#000');
    //             doc.setFontSize(11)
    //             posY += 2.1;
    //             doc.text("My Address:", posX, posY);
    //             posY += 0.2
    //             doc.setFontStyle('normal');
    //             doc.text(this.address, posX, posY, {
    //                 maxWidth: 1.8
    //             });
    //
    //
    //
    //             // Triangle bg
    //             // doc.addImage(triangles,'PNG', 10, 10, 200, 200)
    //
    //
    //
    //             // WARNING #################################
    //             posX = PADDING;
    //             posY += 1.5;
    //             doc.setFontSize(22);
    //             doc.setFontStyle('bold');
    //             doc.text("Always keep your Paper Wallet at a SAFE Place!", posX, posY, {
    //                 maxWidth: (PDF_W - (PADDING*2))
    //             });
    //
    //             // MY ADDRESS #################################
    //
    //             posY += 0.9;
    //
    //
    //             let rectH = 2;
    //             let rectY = 4;
    //
    //             doc.setFillColor("#EBE4FB");
    //             doc.rect(posX, posY, PDF_W-(PADDING*2), rectH, 'F');
    //
    //             // Title
    //             posX += PADDING;
    //             posY += 0.7;
    //             doc.setFontSize(20);
    //             doc.setFontStyle('bold');
    //             doc.text("MY ADDRESS", posX, posY);
    //             // Address
    //             posY += 0.3;
    //             doc.setFontSize(12);
    //             doc.setFontStyle('normal');
    //             doc.text(this.address, posX,posY);
    //             // QR
    //             let qrW = 1.6;
    //             let qrH = 1.6;
    //             let qrX = PDF_W-PADDING - qrW - 0.2;
    //             let qrY = rectY+0.2;
    //
    //             posX = PDF_W-PADDING - qrW - 0.2;
    //             posY -= 1 - 0.2;
    //             QRCode.toDataURL(this.address, function (err, url) {
    //                 doc.addImage(url, 'PNG', posX, posY, qrW, qrH);
    //             });
    //
    //             // MY PRIVATE KEY #################################
    //
    //             posX = PADDING
    //             posY += 2;
    //
    //
    //             rectY += rectH+0.2;
    //             doc.setFillColor("#e4f1fb");
    //             doc.rect(posX, posY, PDF_W-(PADDING*2), rectH, 'F');
    //
    //             // Title
    //             posX += PADDING;
    //             posY += 0.7;
    //
    //             doc.setTextColor('#ff0000');
    //             doc.setFontSize(20);
    //             doc.setFontStyle('bold');
    //             doc.text("MY PRIVATE KEY", posX, posY);
    //             // Address
    //             posY += 0.3;
    //             doc.setTextColor('#000');
    //             doc.setFontSize(12);
    //             doc.setFontStyle('normal');
    //             doc.text(this.privateKey, posX,posY);
    //             // QR
    //
    //             posX = PDF_W-PADDING - qrW - 0.2;
    //             posY -= 1 - 0.2;
    //             qrW = 1.6;
    //             qrH = 1.6;
    //             qrX = PDF_W-PADDING - qrW - 0.2;
    //             qrY = rectY+0.2;
    //             QRCode.toDataURL(this.privateKey, function (err, url) {
    //                 doc.addImage(url, 'PNG', posX, posY, qrW, qrH);
    //             });
    //         },
    //
    //         async refreshPDF() {
    //             let canvas = this.$refs.pdf;
    //             let context = canvas.getContext('2d');
    //
    //
    //             pdfDoc = new jsPDF({
    //                 orientation: 'portrait',
    //                 unit: 'in',
    //                 format: 'letter'
    //             });
    //
    //             this.buildPDF(pdfDoc);
    //
    //
    //            pdfData = pdfDoc.output('dataurlstring', {
    //                 filename: "avapaperwallet.pdf"
    //             });
    //
    //             let pdf = await pdfjsLib.getDocument(pdfData);
    //
    //             const page = await pdf.getPage(1);
    //
    //             let scale = 2;
    //             const viewport = page.getViewport({
    //                 scale: scale
    //             });
    //
    //             canvas.height = viewport.height;
    //             canvas.width = viewport.width;
    //
    //             const renderContext = {
    //                 canvasContext: context,
    //                 viewport: viewport
    //             };
    //             await page.render(renderContext);
    //         }
    //     },
    //     computed: {
    //         address(){
    //             return this.$store.state.address;
    //         },
    //         privateKey(){
    //             return this.$store.state.activeWallet.getCurrentKey().getPrivateKeyString();
    //         },
    //         aspectRatio(){
    //             return PDF_W/PDF_H;
    //         }
    //     },
    //     mounted() {
    //         this.refreshPDF();
    //         // this.updateQR();
    //
    //
    //     }
    // }
</script>
<style scoped>
    .print_modal >>> .modal_body{
        width: auto !important;
    }
    .qr_body{
        padding: 30px;
    }

    .qr_body p{
        word-break: break-all;
    }
    .pdf_preview{
        width: 420px;
        height: 320px;
    }
</style>
