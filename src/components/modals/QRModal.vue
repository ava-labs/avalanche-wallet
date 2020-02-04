<template>
    <modal ref="modal" title="Address">
        <div class="qr_body">
            <canvas ref="qr"></canvas>
            <p>{{address}}</p>
            <copy-text :value="address"></copy-text>
        </div>
    </modal>
</template>
<script>
    import Modal from './Modal';
    import CopyText from "../misc/CopyText";
    import QRCode from 'qrcode'


    export default {
        components: {
            Modal,
            CopyText
        },
        methods: {
            open(){
                this.$refs.modal.open();
            },
            updateQR(){
                let canvas = this.$refs.qr;
                QRCode.toCanvas(canvas, this.address, {
                    scale: 6,
                    color: {
                        light: "#f2f2f2"
                    }
                }, function (error) {
                    // if (error) console.error(error);
                    // console.log('success!');
                })
            }
        },
        computed: {
            address(){
                return this.$store.state.address;
            },
        },
        mounted() {
            this.updateQR();
        }
    }
</script>
<style scoped>
    .qr_body{
        padding: 30px;
    }

    .qr_body p{
        word-break: break-all;
    }
    canvas{
        width: 220px;
        height: 220px;
    }
</style>