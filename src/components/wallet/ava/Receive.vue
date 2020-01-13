<template>
    <div>
        <h3>Receive</h3>
        <b-dropdown id="dropdown-1" :text="dropdown_title" class="m-md-2" >
            <b-dropdown-item v-for="asset in assets" :key="asset.key" @click="select(asset)">{{asset.title}}</b-dropdown-item>
        </b-dropdown>
        <div>
            <canvas ref="qr"></canvas>
        </div>
        <div>
            <label>Send funds to:</label>
            <p>{{selected.address}}</p>
        </div>
    </div>
</template>
<script>
    import QRCode from 'qrcode'

    export default {
        mounted() {

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
                QRCode.toCanvas(canvas, this.selected.address, {
                    scale: 8,
                }, function (error) {
                    if (error) console.error(error)
                    console.log('success!');
                })
            }
        },
        computed:{
            dropdown_title(){
                if(!this.selected) return 'Select an asset to receive';
                else{
                    return this.selected.title;
                }
            }
        }
    }
</script>