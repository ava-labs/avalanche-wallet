<template>
    <div class="addr_card">
        <q-r-modal ref="qr_modal"></q-r-modal>
        <paper-wallet ref="print_modal"></paper-wallet>


        <p class="addr_info">This is your address to receive funds. Your address will change after every successful deposit.</p>
<!--        <h4>{{$t('top.title1')}}</h4>-->
        <div class="bottom">
            <canvas ref="qr"></canvas>
            <div class="bottom_rest">
                <p class="addr_text">{{address}}</p>
                <p class="sub">Default wallet address</p>
                <div class="buts">
                    <button :tooltip="$t('top.hover1')" @click="viewQRModal"><fa icon="qrcode"></fa></button>
                    <button :tooltip="$t('top.hover2')" @click="viewPrintModal"><fa icon="print"></fa></button>
                    <CopyText :tooltip="$t('top.hover3')" :value="address"></CopyText>
                </div>
            </div>

        </div>

    </div>
</template>
<script>
    import CopyText from "@/components/misc/CopyText";
    import QRModal from "@/components/modals/QRModal";
    import PaperWallet from "@/components/modals/PaperWallet";
    import QRCode from "qrcode";

    export default {
        components: {
            CopyText,
            PaperWallet,
            QRModal,
        },
        methods: {
            viewQRModal(){
                this.$refs.qr_modal.open();
            },
            viewPrintModal(){
                this.$refs.print_modal.open();
            },


            updateQR(){
                let canvas = this.$refs.qr;
                let size = canvas.clientWidth;
                QRCode.toCanvas(canvas, this.address, {

                    scale: 6,
                    color: {
                        light: "#fff"
                    },
                    width: size,
                    height: size,
                }, function (error) {
                    if (error) console.error(error);
                    // console.log('success!');
                })
            }
        },
        watch: {
            address(val){
                this.updateQR();
            }
        },
        computed: {
            ava_asset(){
                return this.$store.getters['Assets/AssetAVA'];
            },
            address(){
                return this.$store.state.selectedAddress;
            },
            isUpdateBalance(){
                return this.$store.state.Assets.isUpdateBalance;
            },
        },
        mounted() {
            this.updateQR();
        }
    }
</script>
<style scoped lang="scss">
    .addr_card{
        display: flex;
        flex-direction: column;
    }
    .buts{
        width: 100%;
        text-align: right;
    }
    .buts button{
        font-size: 18px;
        margin: 0px 18px;
        margin-right: 0px;
        position: relative;
        outline: none;
    }

    .buts img{
        height: 20px;
        width: 20px;
        object-fit: contain;
    }
    .buts button[tooltip]:hover:before{
        border-radius: 4px;
        /*left: 0;*/
        left: 0;
        transform: translateX(-50%);
        content: attr(tooltip);
        position: absolute;
        background-color: #303030;
        bottom: 100%;
        color: #ddd;
        width: max-content;
        max-width: 100px;
        font-size: 14px;
        padding: 4px 8px;
    }

    .addr_info{
        background-color: #F5F6FA;
        font-size: 13px;
        font-weight: bold;
        text-align: center;
        padding: 12px 16px;
    }

    $qr_width: 110px;

    .bottom{
        /*margin-top: 15px;*/
        /*padding: 4px 8px;*/
        /*padding-bottom: 0;*/
        display: grid;
        grid-template-columns: $qr_width 1fr;
        column-gap: 6px;

        canvas{
            width: $qr_width;
            height: $qr_width;
            background-color: transparent;
        }

        .bottom_rest{
            padding-top: 14px;
            display: flex;
            flex-direction: column;
        }

        .sub{
            color: #909090;
            font-size: 13px;
            flex-grow: 1;
        }
    }




    .addr_text{
        font-size: 16px;
        word-break: break-all;
    }
</style>
