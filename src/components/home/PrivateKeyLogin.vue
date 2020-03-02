<template>
    <div>
        <qr-input v-model="privateKey"></qr-input>
        <v-btn block depressed @click="access">{{$t('home.submit')}}</v-btn>
    </div>
</template>
<script>
    // import QRInput from "@/components/misc/QRInput";
    import {QrInput} from '@avalabs/vue_components';
    // import QRInput from "@avalabs/qr_input";
    export default {
        components:{
            QrInput
        },
        data(){
            return{
                privateKey: ""
            }
        },
        methods: {
            access(){
                this.$store.dispatch('accessWallet', this.privateKey);
            }
        }
    }
</script>
<style scoped>
    .private_in{
        display: flex;
        align-items: center;
        color: #333;
        background-color: #a5a5a5;
        margin-bottom: 8px;
        padding: 0px 12px;
    }

    .private_in button{
        font-size: 24px;
        /*padding: 8px 0;*/
        padding-right: 12px;
        /*border-bottom: 1px solid;*/
    }

    .pkIn{
        padding: 0;
        margin: 0;
    }
    .pkIn >>> input::placeholder{
        color: #333 !important;
    }
    .pkIn >>> input{
        color: #333 !important;
        text-align: center;
    }
    .pkIn >>> .v-input__slot::before{
        display: none;
        border-color: #d2d2d240 !important;
    }
</style>