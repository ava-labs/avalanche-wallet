<template>
    <div class="card">
        <h1>Private Key</h1>
        <qr-input class="key_in" v-model="privateKey"></qr-input>
        <p class="err" v-if="error">{{error}}</p>
        <v-btn class="but_primary" @click="access" color="#000" depressed>Access Wallet</v-btn>
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
                isLoading: false,
                privateKey: "",
                error: false,
            }
        },
        methods: {
            access(){
                let parent = this;
                this.isLoading = true;
                try{
                    this.$store.dispatch('accessWallet', this.privateKey).then(res => {
                        parent.isLoading = false;
                    });
                }catch (e) {
                    this.error = 'Invalid Private Key';
                    this.isLoading = false;
                }
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
        margin-bottom: 15px;
    }

    .err{
        font-size: 13px;
        color: #f00;
        margin: 14px 0px !important;
    }
</style>
