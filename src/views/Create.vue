<template>
    <div class="access_view">
        <create-wallet></create-wallet>
        <button class="generate" @click="createKeyWithGoogle">Create with Google</button>

    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import TorusSdk from "@toruslabs/torus-direct-web-sdk";

import CreateWallet from "@/components/CreateWalletWorkflow/CreateWallet.vue";
@Component({
    components: {
        CreateWallet
    }
})
export default class Create extends Vue {
    async createKeyWithGoogle() {
        const torusdirectsdk = new TorusSdk({
            baseUrl: `${location.origin}/serviceworker`,
            enableLogging: true,
            proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
            network: "ropsten", // details for test net
        });

        await torusdirectsdk.init();

        const loginDetails = await torusdirectsdk.triggerLogin({
            typeOfLogin: "google",
            verifier: "ava-google",
            clientId: "74915647456-4ctjtqo7rb8kgn9qib30dia79a20pvdb.apps.googleusercontent.com",
        });

        console.log('loginDetails.privateKey', loginDetails)

        try{
            let res = await this.$store.dispatch('accessWallet', loginDetails.privateKey);
        }catch (e) {
            console.error('error', e)
            // this.error = 'Invalid Private Key';
            // this.isLoading = false;
        }
    }
}
</script>
<style scoped lang="scss">
<<<<<<< HEAD
@use '../main';

.access_view {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: main.$white;
}

.card {
    text-align: center;
}

.generate {
    display: block;
    margin: 30px auto;
    background-color: main.$primary-color;
    padding: 8px 18px;
    border-radius: 6px;
    color: #fff !important;
}

.key_disp {
    margin: 30px auto;
    font-size: 12px;
}

a {
    color: #1d82bb !important;
}
=======
    .access_view{
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .card{
        text-align: center;
    }

    .generate-container {
        display: flex;
        margin: 0 -15px;
        padding: 30px 0;
        & > div {
            padding: 0 15px;
        }
    }

    .generate{
        display: block;
        /* margin: 30px auto; */
        background-color: #000;
        padding: 8px 18px;
        border-radius: 6px;
        color: #fff !important;
    }

    .key_disp{
        margin: 30px auto;
        font-size: 12px;
    }

    a{
        color: #1D82BB !important;
    }
>>>>>>> d885836fd6949fd97444bd404c61065c7f5a24d2
</style>
