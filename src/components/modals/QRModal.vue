<template>
    <modal ref="modal" :title="$t('modal.qr.title')">
        <div class="qr_body">
            <canvas ref="qr"></canvas>
            <p>{{address}}</p>
            <CopyText :value="address" class="copyBut">Copy Address</CopyText>
        </div>
    </modal>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

    import Modal from './Modal.vue';
    import CopyText from "../misc/CopyText.vue";
    import QRCode from 'qrcode'
    import {AVMKeyPair} from "slopes";

    @Component({
        components: {
            Modal,
            CopyText
        }
    })
    export default class QRModal extends Vue{
        @Watch('address', { immediate: true })
        onaddrchange(val:string){
            if(val){
                this.updateQR()
            }
        }


        open(){
            // @ts-ignore
            this.$refs.modal.open();
        }
        updateQR(){
            if(!this.address) return;
            let canvas = this.$refs.qr;
            QRCode.toCanvas(canvas, this.address, {
                scale: 6,
                color: {
                    light: "#f2f2f2"
                }
            }, function (error) {
                if (error) console.error(error);
                // console.log('success!');
            })
        }

        get address(){
            let activeKey:AVMKeyPair|null = this.$store.getters.activeKey;
            if(!activeKey){
                return '-'
            }
            return activeKey.getAddressString();
        }

        mounted() {
            this.updateQR();
        }
    }
    //
    // export default {
    //     components: {
    //         Modal,
    //         CopyText
    //     },
    //     methods: {
    //         open(){
    //             this.$refs.modal.open();
    //         },
    //         updateQR(){
    //             if(!this.address) return;
    //             let canvas = this.$refs.qr;
    //             QRCode.toCanvas(canvas, this.address, {
    //                 scale: 6,
    //                 color: {
    //                     light: "#f2f2f2"
    //                 }
    //             }, function (error) {
    //                 if (error) console.error(error);
    //                 // console.log('success!');
    //             })
    //         }
    //     },
    //     computed: {
    //         address(){
    //             return this.$store.state.address;
    //         },
    //     },
    //     watch: {
    //         address(val){
    //             if(val){
    //                 this.updateQR()
    //             }
    //         }
    //     },
    //     mounted() {
    //         this.updateQR();
    //     }
    // }
</script>
<style scoped lang="scss">
    .qr_body{
        padding: 30px;
        text-align: center;
    }

    .qr_body p{
        word-break: break-all;
        text-align: center;
    }
    canvas{
        width: 220px;
        height: 220px;
    }

    .copyBut{
        /*width: 20px;*/
        /*height: 20px;*/
        margin: 15px auto;
        margin-bottom: 0;
        opacity: 0.6;

        &:hover{
            opacity: 1;
        }
        /*display: block;*/
        /*margin: 0px auto;*/
    }
</style>
