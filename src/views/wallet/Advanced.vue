<template>
    <div class="advanced_view">
        <scan-wallet></scan-wallet>
        <backup-wallet></backup-wallet>
<!--        <div class="advanced_block scan_block">-->
<!--            <h4>-->
<!--                <fa icon="camera"></fa><br>-->
<!--                Scan Paper Wallet-->
<!--            </h4>-->
<!--            <div>-->
<!--                <video ref="preview" :active="isScan"></video>-->
<!--                <div v-if="scanCode || isScan">-->
<!--                    <p v-if="scanCode" class="qrSuccess">-->
<!--                        <fa icon="check-circle"></fa><br>-->
<!--                        Code Scanned-->
<!--                    </p>-->
<!--                    <v-text-field :loading="scanLoading" :value="scanValue" color="#ffcc66" class="qrIn" dense disabled :background-color="scanBg"></v-text-field>-->
<!--                </div>-->
<!--                <div v-if="isScan" class="scan_active">-->
<!--                    <v-btn block @click="stopScan" depressed small>Stop Scanning</v-btn>-->
<!--                </div>-->
<!--                <div v-else>-->
<!--                    <v-btn block @click="startScan" depressed>Start Scan</v-btn>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->

<!--        <div class="advanced_block backup">-->
<!--            <h4>-->
<!--                <fa icon="download"></fa><br>-->
<!--                Backup-->
<!--            </h4>-->
<!--            <v-btn block depressed>Backup Wallet</v-btn>-->
<!--            <v-btn block depressed>Restore Backup</v-btn>-->
<!--        </div>-->
    </div>
</template>
<script>
    import { BrowserQRCodeReader } from '@zxing/library';
    import ScanWallet from '@/components/wallet/advanced/ScanWallet';
    import BackupWallet from "@/components/wallet/advanced/BackupWallet";

    export default {
        components: {
            ScanWallet,
            BackupWallet
        },
        data(){
            return {
                scanCode: null,
                isScan: false,
                camera: null,
                scanner: null,
            }
        },
        methods: {
            startScan(){
                let camera = this.camera;
                if(!camera){
                    alert("No Cameras Found");
                    return;
                }

                this.isScan = true;
                this.scanCode = null;
                this.scanner
                    .decodeFromInputVideoDevice(this.camera.deviceId, this.$refs.preview)
                .then(this.onscan)
            },
            stopScan(){
                if(this.scanner){
                    this.scanner.reset();
                    this.isScan = false;
                }
            },
            onscan(result){
                // console.log(result);
                this.scanCode = result.text;
                this.stopScan();
            }
        },
        destroyed() {
            this.stopScan();
            this.scanCode = null;
        },
        mounted() {
            let parent = this;

            const codeReader = new BrowserQRCodeReader();
            codeReader
                .listVideoInputDevices()
                .then(videoInputDevices => {
                    if(videoInputDevices.length > 0){
                        let camera = videoInputDevices[0];
                        parent.camera = camera;
                    }else{
                        // console.error('No Cameras Found');
                    }
                })
                .catch((err) => {
                    // console.error(err)
                });

            this.scanner = codeReader;
        },
        computed: {
            scanValue(){
                if(!this.scanCode){
                    return "waiting for a valid QR code"
                }else{
                    return this.scanCode;
                }
            },
            scanLoading(){
                if(!this.scanCode){
                    return "#ffcc66"
                }else{
                    return false;
                }
            },
            scanBg(){
                if(!this.scanCode){
                    return 'transparent';
                }
                return "#1b1b1b";
            }
        }
    }
</script>
<style scoped>
    .advanced_view{
        display: grid;
        grid-template-columns: 1fr 1fr;
        row-gap: 15px;
        grid-gap: 15px;
    }

    .advanced_view > div{
        background-color: #505050;
        border-radius: 6px;
        color: #ddd;
        padding: 8px 0px;
    }

    .advanced_view > div h4{

    }

    .advanced_main{
        display: flex;
    }
    h4{
        padding: 15px;
        color: #d2d2d2;
        font-size: 18px;
    }
    .advanced_block{
        margin: 0px 15px;
        padding: 20px;
        padding-top: 0px;
        border-radius: 3px;
        width: min-content;
        height: min-content;
        background-color: #353535;
    }
    video{
        background-color: #404040;
        display: block;
        height: 0px;
        width: 250px;
        max-width: 250px;
        transition-duration: 0.4s;
        /*height: 250px;*/
    }
    video[active]{
        height: 190px;
    }

    .v-btn{
        background-color: transparent !important;
        color: #d2d2d2;
        border: 1px solid #d2d2d2;
    }

    .backup button{
        margin: 5px 0px;
    }

    .qrIn >>> input{
        text-align: center;
        color: #d2d2d2 !important;
        padding: 8px !important;
    }

    .qrSuccess{
        margin: 0 !important;
        color: #ffcc66;
    }

    @media only screen and (max-width: 600px) {
        .advanced_main{
            display: block;
            padding: 15px;
        }

        h4{
            font-size: 14px;
        }

        .advanced_block{
            width: 100%;
            margin: 10px 0px;
        }

        video{
            width: 100%;
        }
    }
</style>

<style>
    .advanced_view .card_header{
        font-size: 25px;
        text-align: left;
        border-bottom: 1px solid #707070;
        margin-bottom: 6px;
        padding: 0px 15px;
    }

    .card_header span{
        float: right;
    }

    .advanced_view .card_body{
        padding: 6px 15px;
    }

    .advanced_view label{
        margin: 0;
        font-weight: bold;
        font-size: 12px;
        text-align: left;
    }
</style>