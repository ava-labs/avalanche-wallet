<template>
    <div class="card">
        <h1>Access Wallet</h1>
        <p>How do you want to access your wallet?</p>
        <div class="options">
            <div class="option">
                <h4>Private Key</h4>
                <p>ZvtFTgZjuVvrNrdBcfqFozx...</p>
                <router-link to="/access/private_key"></router-link>
            </div>
            <div class="option">
                <h4>Keystore File</h4>
                <p>AVA_ZvtFT.json</p>
                <router-link to="/access/keystore"></router-link>
            </div>
            <div class="option" @click="loginWithGoogle">
                <h4>Google</h4>
            </div>
        </div>
        <router-link to="/create">Don't have a wallet?</router-link>
    </div>
</template>

<script>
import TorusSdk from "@toruslabs/torus-direct-web-sdk";

export default {
    methods: {
        async loginWithGoogle() {
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
}
</script>

<style scoped lang="scss">
    @use '../../main';

    $col_w: 240px;
    .options{
        margin: 30px auto;
        display: grid;
        grid-template-columns: $col_w $col_w $col_w;
        grid-gap: 30px;

        >div{

        }

        h4{
            font-size: 18px;
        }

        p{
            font-size: 13px;
            margin-top: 12px !important;
            color: #ac65d8;
        }
    }

    a{
        color: #1D82BB !important;
    }

    .option{
        position: relative;
        transition-duration: 0.1s;
        transition-timing-function: ease-in;
        box-shadow: 4px 3px 10px rgba(0,0,0,0.2);
        border-radius: 4px;
        padding: 30px;
        cursor: pointer;

        a{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }


        &:hover{
            transform: translateY(-5px);
            box-shadow: 4px 8px 10px rgba(0,0,0,0.2);
        }
    }


    @media only screen and (max-width: main.$mobile_width) {
        .options{
            display: block;
            grid-template-columns: none;
        }

        .option{
            margin-bottom: 30px;

        }
    }
</style>
