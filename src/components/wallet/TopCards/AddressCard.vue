<template>
    <div class="addr_card">
        <q-r-modal ref="qr_modal"></q-r-modal>
        <paper-wallet ref="print_modal"></paper-wallet>
        <p class="addr_info">{{warningText}}</p>
        <div class="bottom">
            <div>
                <canvas ref="qr"></canvas>
            </div>
            <div class="bottom_rest">
                <p class="addr_text">{{address}}</p>
                <p class="subtitle">Derived AVAX Wallet Address</p>
                <div style="display: flex; margin-top: 10px;">
                    <div class="buts">
                        <button :tooltip="$t('top.hover1')" @click="viewQRModal" class="qr_but"></button>
                        <button :tooltip="$t('top.hover2')" @click="viewPrintModal" class="print_but"></button>
                        <CopyText :tooltip="$t('top.hover3')" :value="address" class="copy_but"></CopyText>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

    import CopyText from "@/components/misc/CopyText.vue";
    import QRModal from "@/components/modals/QRModal.vue";
    import PaperWallet from "@/components/modals/PaperWallet/PaperWallet2.vue";
    import QRCode from "qrcode";
    import {AVMKeyPair} from "avalanche";

    @Component({
        components: {
            CopyText,
            PaperWallet,
            QRModal,
        }
    })
    export default class AddressCard extends Vue{
        colorLight: string = "#FFF";
        colorDark: string = "#242729";

        $refs!: {
            qr_modal: QRModal,
            print_modal: PaperWallet,
            qr: HTMLCanvasElement
        };


        @Watch('address')
        onaddrchange(){
            this.updateQR()
        }

        @Watch('$root.theme', {immediate: true})
        onthemechange(val:string){
            if(val==='night'){
                this.colorDark = "#E5E5E5";
                this.colorLight = "#242729";
            }else{
                this.colorDark = "#242729";
                this.colorLight = "#FFF";
            }
            this.updateQR();
        }

        get isDayTheme(): boolean{
            //@ts-ignore
            return this.$root.theme === 'day';
        }
        get address(){
            let activeKey:AVMKeyPair|null = this.$store.getters.activeKey;
            if(!activeKey){
                return '-'
            }
            return activeKey.getAddressString();
        }

        get warningText():string{
            return "This is your address to receive funds. Your address will change after every deposit.";
        }

        viewQRModal(){
            // @ts-ignore
            this.$refs.qr_modal.open();
        }
        viewPrintModal(){
            let modal = this.$refs.print_modal;
            // @ts-ignore
            modal.open();
        }
        updateQR(){
            let canvas = this.$refs.qr as HTMLCanvasElement;
            if(!canvas) return;

            let size = canvas.clientWidth;
            QRCode.toCanvas(canvas, this.address, {
                scale: 6,
                color: {
                    light: this.colorLight,
                    dark: this.colorDark,
                },
                width: size,
                // height: size,
            }, function (error:any) {
                if (error) console.error(error);
            })
        }

        mounted() {
            this.updateQR();
        }
    }
</script>
<style scoped lang="scss">
@use '../../../main';

    .addr_card{
        display: flex;
        flex-direction: column;
    }
    .buts{
        width: 100%;
        text-align: right;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: var(--primary-color-light);

        > *{
            font-size: 18px;
            margin: 0px 18px;
            margin-right: 0px;
            position: relative;
            outline: none;
            width: 18px;
            height: 18px;
            opacity: 0.6;

            background-size: contain;
            background-position: center;
            &:hover{
                opacity: 1;
            }
        }
    }


    .qr_but{
        background-image: url("/img/qr_icon.png");
    }
    .print_but{
        background-image: url("/img/faucet_icon.png");
    }
    .copy_but{
        color: var(--primary-color);
    }



    @include main.night-mode{
        .qr_but{
            background-image: url("/img/qr_icon_night.svg");
        }
        .print_but{
            background-image: url("/img/print_icon_night.svg");
        }
    }



    .addr_info{
        background-color: var(--bg-light);
        font-size: 13px;
        font-weight: bold;
        text-align: center;
        padding: 12px 16px;
        margin-bottom: 12px !important;
    }

    $qr_width: 110px;

    .bottom{
        display: grid;
        grid-template-columns: $qr_width 1fr;
        column-gap: 14px;

        canvas{
            width: $qr_width;
            height: $qr_width;
            background-color: transparent;
        }

        .bottom_rest{
            padding-top: 4px;
            display: flex;
            flex-direction: column;
        }
    }

    .sub{
        margin: 0px 10px !important;
        text-align: center;
        font-size: 0.7rem;
        background-color: main.$secondary-color;
        color: #fff;
        padding: 3px 6px;
        border-radius: 3px;
    }

    .subtitle{
        font-size: 0.7rem;
        color: var(--primary-color-light);
        flex-grow: 1;
    }

    .addr_text{
        font-size: 16px;
        word-break: break-all;
        color: var(--primary-color-light);
    }
</style>
