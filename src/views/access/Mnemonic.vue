import {Buffer} from "buffer";
<template>
    <div class="mnemonic_auth">
        MNEMONIC
        <label>Key Phrase</label>
        <textarea v-model="phrase"></textarea>

        <label>Preview</label>
        <mnemonic-display :phrase="phrase" class="phrase_disp"></mnemonic-display>

        <v-btn class="but_primary access" @click="access" color="#000" depressed>Access Wallet</v-btn>
        <router-link to="/access">Cancel</router-link>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
    import {Buffer} from "buffer/";

    import * as bip39 from 'bip39';
    import {bintools, keyChain} from "@/AVA";

    @Component({
        components: {
            MnemonicDisplay
        },
    })
    export default class Mnemonic extends Vue{
        phrase:string = "";


        access(){
            let phrase = this.phrase;
            let words = phrase.split(' ');

            // not a valid key phrase
            if(words.length !== 24){
                return;
            }

            let entropy = bip39.mnemonicToEntropy(phrase);
            let b = new Buffer(entropy, 'hex');
            // let buf = Buffer.from(entropy) as Buffer;

            console.log(b);
            // let hex = Buffer.from(privk).toString('hex');
            // let mnemonic = bip39.entropyToMnemonic(hex);

            // bintools.
            // var hex_string = entropy;
            // var tokens = hex_string.match(/\d\d/gi);
            // var result = tokens.map(t => parseInt(t, 16));
            //
            // let buf = Buffer.from(result);
            //
            // bintools.avaSerialize(buf);
            //
            // console.log(result)
            // console.log(buf)
            let addr = keyChain.importKey(b);
            let keypair = keyChain.getKey(addr);

            let pkString = keypair.getPrivateKeyString();
            // console.log(keypair.getPrivateKeyString())

            this.$store.dispatch('accessWallet', pkString);
            //
            // console.log(addr);
            // parseInt(entropy, 16);
            //
            // console.log(parseInt(entropy,16));
            // // Int8Array.from()
            // console.log(entropy);
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
    }


    .access{
        margin-top: 60px;
    }
</style>
