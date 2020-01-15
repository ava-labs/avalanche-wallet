<template>
    <div class="qr_reader">
        <div class="clickStart" @click="start"></div>
        <slot class="qr_slot" ></slot>
        <div class="qr_popup" v-show="isActive">
            <div class="progress">
                <v-progress-circular :size="20" indeterminate color="#ffcc66"></v-progress-circular>
                <p>Waiting for a QR Code</p>
            </div>
            <button @click="stop"><fa icon="times-circle"></fa></button>
            <video ref="preview"></video>
        </div>
    </div>
</template>
<script>
    import { BrowserQRCodeReader } from '@zxing/library';

    export default {
        data(){
            return {
                scanner: null,
                isActive: false,
            }
        },
        methods: {
            start(){
                let camera = this.camera;
                if(!camera){
                    alert("No Cameras Found");
                    return;
                }

                this.isActive = true;
                this.scanner
                    .decodeFromInputVideoDevice(this.camera.deviceId, this.$refs.preview)
                    .then(this.onscan)
            },
            onscan(result){
                this.$emit("change", result.text);
                this.stop();
            },
            stop(){
                if(this.scanner){
                    this.scanner.reset();
                }
                this.isActive = false;
            }
        },
        mounted(){
            let parent = this;

            const codeReader = new BrowserQRCodeReader();
            codeReader
                .listVideoInputDevices()
                .then(videoInputDevices => {
                    if(videoInputDevices.length > 0){
                        let camera = videoInputDevices[0];
                        parent.camera = camera;
                    }else{
                        console.error('No Cameras Found');
                    }
                })
                .catch(err => console.error(err));

            this.scanner = codeReader;
        }
    }
</script>
<style scoped>
    .qr_reader{
        position: relative;
    }
    .qr_popup{
        position: fixed;
        max-width: 80%;
        overflow: hidden;
        left: 50%;
        top: 50%;
        /*transform: translateX(-50%);*/
        transform: translate(-50%, -50%);
        z-index: 10;
    }

    .qr_popup video{
        background-color: #202020;
        /*max-width: 100%;*/
    }

    .qr_popup button{
        position: absolute;
        top: 6px;
        right: 12px;
        z-index: 2;
    }

    .clickStart{
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .qr_slot{
        cursor: pointer;
        /*user-select: none;*/
        /*pointer-events: none;*/
    }

    .progress{
        position: absolute;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
    }
    .progress p{
        font-size: 12px;
        margin: 0;
    }
    .v-progress-circular{

    }
</style>