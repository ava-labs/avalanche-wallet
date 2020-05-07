<template>
    <div class="card">
        <h1>Private Key</h1>
        <qr-input class="key_in" v-model="privateKey"></qr-input>
        <button class="but_primary" @click="access">Access Wallet</button>
        <router-link to="/access">Cancel</router-link>
    </div>
</template>
<script>
    import {QrInput} from '@avalabs/vue_components';

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
<style scoped lang="scss">
    .key_in{
        margin: 30px auto;
        width: 380px;
        font-size: 13px;
        background-color: #e2e2e2;
    }

    a{
        color: #1D82BB !important;
    }

    .but_primary{
        margin: 0px auto;
        display: block;
    }
</style>
