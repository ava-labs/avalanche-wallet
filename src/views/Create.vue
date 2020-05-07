<template>
    <div class="access_view">
        <div class="card">
            <transition name="fade" mode="out-in">
                <div v-if="!newPrivateKey">
                    <h1>Create Wallet</h1>
                    <p>Generate a new private key to use with your wallet.</p>
                    <button class="generate" @click="createKey">Generate Private Key</button>
                    <router-link to="/access">Already have a wallet?</router-link>
                </div>
                <div v-else>
                    <h1>Your wallet is ready.</h1>
                    <p>Do not lose your private key! There is no way to recover lost keys.</p>
                    <text-display-copy :value="newPrivateKey" class="key_disp"></text-display-copy>
                    <button class="generate" @click="access">Access Wallet</button>
                </div>
            </transition>
        </div>
    </div>
</template>
<script>
    import TextDisplayCopy from "../components/misc/TextDisplayCopy";
    import {keyChain} from "../AVA";

    export default {
        components: {
            TextDisplayCopy
        },
        data(){
            return{
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

                // console.log(keypair.getAddressString());
                this.newAddr = keypair.getAddressString();
                this.newPrivateKey = privkstr;
                this.newPublicKey = pubkstr;
            },

            access(){
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

    .generate{
        display: block;
        margin: 30px auto;
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
