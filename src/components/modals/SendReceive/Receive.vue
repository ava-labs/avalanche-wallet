<template>
    <div class="receive_body">
        <div>
            <canvas ref="qr"></canvas>
        </div>
        <div>
            <label>Send funds to:</label>
            <p class="receive_address">{{address}}</p>
        </div>
    </div>
</template>
<script>
    import QRCode from 'qrcode'

    export default {
        mounted() {
            this.updateQR();
        },
        props:{
            assets: Array
        },
        data(){
            return{
                address: "asdbfd236SDFGAGge24",
                selected: null,
            }
        },
        methods: {
            select(asset){
                this.selected = asset;
                this.updateQR();
            },
            updateQR(){
                let canvas = this.$refs.qr;
                QRCode.toCanvas(canvas, this.address, {
                    scale: 8,
                }, function (error) {
                    // if (error) console.error(error);
                    // console.log('success!');
                })
            }
        },
        computed:{
            // dropdown_title(){
            //     if(!this.selected) return 'Select an asset to receive';
            //     else{
            //         return this.selected.title;
            //     }
            // }
        }
    }
</script>
<style scoped>
    .receive_body{
        padding: 15px;
        background-color: #333333 !important;
    }
    .receive_address{
        background-color: #303030;
        color: #99ffd1;
        padding: 12px;
        margin: 10px 0px;
        letter-spacing: 1px;
    }

    label{
        color: #d2d2d2;
        text-align: left;
        font-weight: bold;
    }
</style>