<template>
    <div class="access_card">
        <div class="img_container">
            <img src="@/assets/diamond-primary.svg" alt />
        </div>
        <h1>How do you want to access your wallet?</h1>
        <router-link to="/create" class="link">Don't have a wallet?</router-link>
        <hr />
        <div class="options">
            <router-link to="/access/private_key" class="option">Private Key</router-link>
            <router-link to="/access/mnemonic" class="option">Mnemonic Key Phrase</router-link>
            <router-link to="/access/keystore" class="option">Keystore File</router-link>
            <div class="option" @click="loginWithGoogle">
                <h4>Google</h4>
            </div>
<!--            <div class="option">-->
<!--                <h2>Private Key</h2>-->
<!--            </div>-->
<!--            <div class="option">-->
<!--                <h2>Mnemonic Key Phrase</h2>-->
<!--            </div>-->
<!--            <div class="option">-->
<!--                <h2>Keystore File</h2>-->
<!--            </div>-->
        </div>
        <router-link to="/" class="link">Cancel</router-link>
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
@use "../../main";

.access_card {
    background-color: main.$background-color !important;
    padding: main.$container-padding;
}

img {
    width: main.$img-size;
    height: main.$img-size;
    margin-bottom: main.$vertical-padding;
}

h1 {
    font-size: main.$l-size;
    font-weight: 400;
}

hr {
    max-width: 67% !important;
    margin: main.$vertical-padding auto 0;
    color: main.$primary-color-light;
    opacity: 0.2;
}

.options {
    margin: 30px auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 30px;
}

.option {
    position: relative;
    transition-duration: 0.1s;
    transition-timing-function: ease-in;
    color: main.$white !important;
    background-color: main.$primary-color;
    border-radius: 6px;
    font-family: "DM Sans", sans-serif;
    font-weight: 700 !important;
    text-transform: uppercase;
    padding: 8px 18px;
    font-size: main.$s-size;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 4px 8px 10px rgba(0, 0, 0, 0.2);
    }


    h2 {
    }
}


@include main.mobile-device {
    img {
        width: main.$img-size-mobile;
        height: main.$img-size-mobile;
        margin-bottom: main.$vertical-padding-mobile;
    }

    h1 {
        font-size: main.$l-size-mobile;
    }

    .card {
        padding: main.$container-padding-mobile;
    }

    .options {
        display: block;
        grid-template-columns: none;
    }

    .option {
        margin: 12px 0px;
        display: block;
    }
}
</style>
