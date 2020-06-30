import {Buffer} from "buffer";
<template>
    <div class="mnemonic_auth">
        <div class="left">
            <header>
                <h1>Enter your MNEMONIC phrase</h1>
            </header>
            <label>Hit ‘SPACE’ after every successful word entry.</label>
            <textarea v-model="phrase"></textarea>
            <div class="button_container">
                <v-btn
                    class="but_primary access"
                    @click="access"
                    color="#000"
                    depressed
                    :loading="isLoading"
                >Access Wallet</v-btn>
                <router-link to="/access">Cancel</router-link>
            </div>
        </div>
        <div class="right">
            <label>Preview</label>
            <mnemonic-display :phrase="phrase" class="phrase_disp"></mnemonic-display>
            <p class="err" v-if="err">{{err}}</p>
            <remember-key
                class="remember"
                v-model="isRemember"
                explain="Remember key phrase for easy access"
            ></remember-key>
        </div>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
import RememberKey from "@/components/misc/RememberKey.vue";
import { Buffer } from "buffer/";

import * as bip39 from "bip39";
import { bintools, keyChain } from "@/AVA";
import { AddWalletInput } from "@/store/types";

@Component({
    components: {
        MnemonicDisplay,
        RememberKey
    }
})
export default class Mnemonic extends Vue {
    phrase: string = "";
    isLoading: boolean = false;
    isRemember: boolean = false;
    err: string = "";

    errCheck() {
        let phrase = this.phrase;
        let words = phrase.split(" ");

        // not a valid key phrase
        if (words.length !== 24) {
            this.err =
                "Invalid key phrase. Your phrase must be 24 words separated by a single space.";
            return false;
        }

        return true;
    }

    async access() {
        let phrase = this.phrase;

        this.isLoading = true;
        this.$store.state.rememberKey = this.isRemember;

        if (!this.errCheck()) {
            this.isLoading = false;
            return;
        }

        try {
            let entropy = bip39.mnemonicToEntropy(phrase);
            let b = new Buffer(entropy, "hex");

            let addr = keyChain.importKey(b);
            let keypair = keyChain.getKey(addr);

            let pkString = keypair.getPrivateKeyString();
            let inVal: AddWalletInput = {
                pk: pkString,
                type: "hd"
            };

            await this.$store.dispatch("accessWallet", inVal);
            this.isLoading = false;
        } catch (e) {
            this.isLoading = false;
            this.err = "Invalid key phrase.";
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.mnemonic_auth {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 60px;
    background-color: main.$background-color;
    padding: main.$container-padding;
    width: 100%;
    max-width: 1200px;

.left, 
.right {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}
    > * {
        width: 100%;
    }
}

h1 {
    text-align: left;
    font-size: main.$m-size;
}

textarea {
    width: 100%;
    background-color: main.$white !important;
}

label {
    text-align: left;
    color: main.$primary-color-light;
    font-size: 12px;
    margin-bottom: 20px;
}

textarea {
    background-color: #eaeaea;
    resize: none;
    min-height: 120px;
    padding: 8px 16px;
    font-size: 14px;
    margin-bottom: main.$vertical-padding;
}

.phrase_disp {
    width: 100%;
    max-width: 560px;
    margin-bottom: main.$vertical-padding;
}

.err {
    font-size: 13px;
    color: #f00;
    text-align: center;
    margin: 14px 0px !important;
}

.remember {
    margin-top: -20px;
    font-size: .75em;
}

.key_in {
    margin: 30px auto;
    margin-bottom: 6px;
    width: 100%;
    font-size: 13px;
    background-color: main.$white;
    border-radius: 4px;
}

a {
    color: main.$primary-color-light !important;
    text-decoration: underline !important;
    margin: 10px 0 20px;
}

.but_primary {
    margin: 0px auto;
    display: block;
    margin-top: 20px;
    margin-bottom: 15px;
    background-color: main.$primary-color !important;
    border-radius: 6px;
    font-family: "DM Sans", sans-serif;
    font-weight: 700;
    text-transform: uppercase !important;
}

.button_container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}
</style>
