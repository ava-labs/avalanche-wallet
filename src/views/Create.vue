<template>
    <div class="access_view">
        <div class="card">
            <transition name="fade" mode="out-in">
                <div v-if="!newPrivateKey">
                    <h1>Create Wallet</h1>
                    <p>Generate a new private key to use with your wallet.</p>
                    <div class="generate-container">
                        <div>
                            <button class="generate" @click="createKey">Generate Private Key</button>
                        </div>
                        <div>
                            <button class="generate" @click="createKeyWithGoogle">Create with Google</button>
                        </div>
                    </div>
                    <router-link to="/access">Already have a wallet?</router-link>
                </div>
                <div v-else>
                    <h1>Your wallet is ready.</h1>
                    <p>Do not lose your private key! There is no way to recover lost keys.</p>
                    <text-display-copy :value="newPrivateKey" class="key_disp"></text-display-copy>
                    <remember-key v-model="rememberKey"></remember-key>
                    <button class="generate" @click="access">Access Wallet</button>
                </div>
            </transition>
        </div>
    </div>
</template>
<script>
    import TextDisplayCopy from "../components/misc/TextDisplayCopy";
    import {keyChain} from "../AVA";
    import RememberKey from "@/components/misc/RememberKey";
    import TorusSdk from "@toruslabs/torus-direct-web-sdk";

    export default {
        components: {
            RememberKey,
            TextDisplayCopy
        },
        data(){
            return{
                rememberKey: false,
                newPrivateKey: null,
                newPublicKey: null,
                newAddr: null
            }
        },
        methods: {
            createKey(){
                let addr = keyChain.makeKey();
                let keypair = keyChain.getKey(addr);

                let pubk = keypair.getPublicKey(); //returns Buffer
                let pubkstr = keypair.getPublicKeyString(); //returns an AVA serialized string

                let privk = keypair.getPrivateKey(); //returns Buffer
                let privkstr = keypair.getPrivateKeyString(); //returns an AVA serialized string

                console.log('getPublicKeyString', pubkstr)
                console.log('getPrivateKeyString', privkstr)
                
                // console.log(keypair.getAddressString());
                this.newAddr = keypair.getAddressString();
                this.newPrivateKey = privkstr;
                this.newPublicKey = pubkstr;
            },

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
            },

            access(){
                this.$store.state.rememberKey = this.rememberKey;
                this.$store.dispatch('accessWallet', this.newPrivateKey);
            }
        }
    }
</script>
<style scoped lang="scss">
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
</style>
