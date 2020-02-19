<template>
    <modal ref="modal" title="Print Preview" class="print_modal">
        <div class="qr_body">
            <canvas class="pdf_preview" ref="pdf" :style="{
                height: `${600}px`,
                width: `${600*aspectRatio}px`
            }"></canvas>
            <v-btn depressed block @click="print">Print</v-btn>
        </div>
    </modal>
</template>
<script>
    import Modal from './Modal';
    // import CopyText from "../misc/CopyText";
    import QRCode from 'qrcode'
    import jsPDF from 'jspdf';
    var pdfjsLib = require("pdfjs-dist");
    import printjs from 'print-js'


    const PDF_W = 8.5;
    const PDF_H = 11;
    const PDF_ASPECT_RATIO = PDF_W/PDF_H;
    const PADDING = 0.5;

    let pdfDoc = null;
    let pdfData = '';

    export default {
        components: {
            Modal,
            // CopyText
        },
        methods: {
            open(){
                this.$refs.modal.open();
            },

            print(){
                const pdfBlob = new Blob([pdfDoc.output('blob')], { type: "application/pdf" });
                const url = URL.createObjectURL(pdfBlob);
                printjs(url);
            },

            buildPDF(doc){


                // WARNING #################################
                doc.setFontSize(28);
                doc.setFontStyle('bold');
                doc.text("Always keep your Paper Wallet at a SAFE Place!", PADDING+0.5, PADDING+0.5, {
                    maxWidth: (PDF_W - (PADDING*2))
                });

                // MY ADDRESS #################################


                let rectH = 2;
                let rectY = 2;

                doc.setFillColor("#f4faff");
                doc.rect(PADDING, rectY, PDF_W-(PADDING*2), rectH, 'F');

                // Title
                doc.setFontSize(20);
                doc.setFontStyle('bold');
                doc.text("MY ADDRESS", PADDING+0.5, rectY+((rectH/2)));
                // Address
                doc.setFontSize(12);
                doc.setFontStyle('normal');
                doc.text(this.address, PADDING+0.5,rectY+((rectH/2)+0.3));
                // QR
                let qrW = 1.6;
                let qrH = 1.6;
                let qrX = PDF_W-PADDING - qrW - 0.2;
                let qrY = rectY+0.2;
                QRCode.toDataURL(this.address, function (err, url) {
                    doc.addImage(url, 'PNG', qrX, qrY, qrW, qrH);
                });

                // MY PRIVATE KEY #################################

                rectY += rectH+0.2;
                doc.setFillColor("#f4faff");
                doc.rect(PADDING, rectY, PDF_W-(PADDING*2), rectH, 'F');

                // Title
                doc.setTextColor('#ff0000');
                doc.setFontSize(20);
                doc.setFontStyle('bold');
                doc.text("MY PRIVATE KEY", PADDING+0.5, rectY+((rectH/2)));
                // Address
                doc.setTextColor('#000');
                doc.setFontSize(12);
                doc.setFontStyle('normal');
                doc.text(this.privateKey, PADDING+0.5,rectY+((rectH/2)+0.3));
                // QR
                qrW = 1.6;
                qrH = 1.6;
                qrX = PDF_W-PADDING - qrW - 0.2;
                qrY = rectY+0.2;
                QRCode.toDataURL(this.privateKey, function (err, url) {
                    doc.addImage(url, 'PNG', qrX, qrY, qrW, qrH);
                });
            },

            async refreshPDF() {
                let canvas = this.$refs.pdf;
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

                let pdf = await pdfjsLib.getDocument(pdfData);

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
                await page.render(renderContext);
            }
        },
        computed: {
            address(){
                return this.$store.state.selectedAddress;
            },
            privateKey(){
                return this.$store.state.privateKey;
            },
            aspectRatio(){
                return PDF_W/PDF_H;
            }
        },
        mounted() {
            this.refreshPDF();
            // this.updateQR();


        }
    }
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