import {Buffer} from "buffer";
<template>
    <div class="mnemonic_auth">
        MNEMONIC
        <label>Key Phrase</label>
        <textarea v-model="phrase"></textarea>

        <label>Preview</label>
        <mnemonic-display :phrase="phrase" class="phrase_disp"></mnemonic-display>
        <p class="err" v-if="err">{{err}}</p>

        <remember-key class="remember" v-model="isRemember" explain="Remember key phrase for easy access"></remember-key>
        <v-btn class="but_primary access" @click="access" color="#000" depressed :loading="isLoading">Access Wallet</v-btn>
        <router-link to="/access">Cancel</router-link>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
    import RememberKey from "@/components/misc/RememberKey.vue";
    import {Buffer} from "buffer/";

    import * as bip39 from 'bip39';
    import {bintools, keyChain} from "@/AVA";

    @Component({
        components: {
            MnemonicDisplay,
            RememberKey
        },
    })
    export default class Mnemonic extends Vue{
        phrase:string = "";
        isLoading:boolean = false;
        isRemember:boolean = false;
        err:string = "";

        errCheck(){
            let phrase = this.phrase;
            let words = phrase.split(' ');

            // not a valid key phrase
            if(words.length !== 24){
                this.err = "Invalid key phrase. Your phrase must be 24 words separated by a single space.";
                return false;
            }


            return true;
        }

        access(){
            let phrase = this.phrase;

            this.isLoading = true;
            this.$store.state.rememberKey = this.isRemember;


            if(!this.errCheck()) {
                this.isLoading = false;
                return;
            }

            try{
                let entropy = bip39.mnemonicToEntropy(phrase);
                let b = new Buffer(entropy, 'hex');

                let addr = keyChain.importKey(b);
                let keypair = keyChain.getKey(addr);

                let pkString = keypair.getPrivateKeyString();

                this.$store.dispatch('accessWallet', pkString);
                this.isLoading = false;
            }catch(e){
                this.isLoading = false;
                this.err = 'Invalid key phrase.'
            }
        }
    }
</script>
<style scoped lang="scss">
    .mnemonic_auth{
        display: flex;
        flex-direction: column;
        /*align-items: center;*/
        width: 100%;
        max-width: 560px;

        > * {
            width: 100%;
        }
    }

    label{
        text-align: left;
        /*font-weight: bold;*/
        color: #999;
        font-size: 12px;
    }

    textarea{
        background-color: #eaeaea;
        resize: none;
        height: 80px;
        padding: 8px 16px;
        font-size: 14px;
        margin-bottom: 30px;
    }

    .phrase_disp{
        margin-bottom: 60px;
    }

    .remember{
    }

    .err{
        font-size: 13px;
        color: #f00;
        text-align: center;
        margin: 14px 0px !important;
    }



    .access{
    }
</style>
