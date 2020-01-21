<template>
    <div>
        <h4><fa style="transform: rotateZ(180deg)" icon="sign-in-alt"></fa><br>Receive</h4>
        <div class="receive_body">
            <div>
                <canvas ref="qr"></canvas>
            </div>
            <div>
                <label>Send funds to:</label>
                <p class="receive_address">{{address}}</p>
            </div>
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
        computed:{
            address(){
                return this.$store.state.address;
            }
        }
    }
</script>