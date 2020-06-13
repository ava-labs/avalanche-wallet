<template>
    <div class="access_view">
        <div class="card">
            <transition name="fade" mode="out-in">
                <div v-if="!newPrivateKey">
                    <h1>Create Wallet</h1>
                    <p>Generate a new key phrase to use with your wallet.</p>
                    <button class="generate" @click="createKey">Generate Key Phrase</button>
                    <router-link to="/access">Already have a wallet?</router-link>
                </div>

                <div v-else class="stage_2">
                    <div class="cols">
                        <div>
                            <div class="mnemonic_disp">
                                <mnemonic-display :phrase="keyPhrase"></mnemonic-display>
                                <p class="phrase_raw">{{keyPhrase}}</p>
                                <div>
                                    <CopyText :value="keyPhrase" class="copy_phrase">Copy Key Phrase</CopyText>
                                </div>
                                <button @click="createKey"><fa icon="sync"></fa> Randomize</button>
                            </div>
                        </div>
                        <div class="phrase_disp_col">
                            <h1>This is your key phrase.</h1>
                            <p>You will use these words to access your wallet.</p>
                            <p class="warn"><b>WARNING</b><br> Store this key phrase in a secure location. Anyone with this key phrase can access your wallet. There is no way to recover lost key phrases.</p>
                            <div class="access_cont">
                                <remember-key v-model="rememberKey" explain="Remember key phrase. Your keys will persist until you close the browser tab."></remember-key>
                                <button class="access generate" @click="access">Access Wallet</button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import TextDisplayCopy from "@/components/misc/TextDisplayCopy.vue";
    import {bintools, cryptoHelpers, keyChain} from "@/AVA";
    import RememberKey from "@/components/misc/RememberKey.vue";
    import {Buffer} from "buffer/";

    import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
    import CopyText from "@/components/misc/CopyText.vue";

    import * as bip39 from 'bip39';
    var HDKey = require('hdkey');

    // import * as bip32 from 'bip32';
    // import { BIP32Interface } from 'bip32';
    import AvaHdWallet from "@/js/AvaHdWallet";

    import {KeyPair} from "slopes";

    @Component({
        components: {
            CopyText,
            RememberKey,
            TextDisplayCopy,
            MnemonicDisplay
        }
    })
    export default class CreateWallet extends Vue{
        rememberKey:boolean = false;
        newPrivateKey: string|null =null;
        keyPhrase: string = "";
        keyPair: KeyPair|null = null;


        createKey():void{
            let mnemonic = bip39.generateMnemonic(256);
            let entropy = bip39.mnemonicToEntropy(mnemonic);
            let b = new Buffer(entropy, 'hex');

            let addr = keyChain.importKey(b);
            let keypair = keyChain.getKey(addr);
            let privkstr = keypair.getPrivateKeyString();

            // Remove because it will get added in accessWallet dispatch
            keyChain.removeKey(keypair);

            this.keyPair = keypair;
            this.keyPhrase = mnemonic;
            this.newPrivateKey = privkstr;
        }

        async access(): Promise<void>{
            if(!this.keyPair) return;

            this.$store.state.rememberKey = this.rememberKey;
            this.$store.dispatch('accessWallet', this.newPrivateKey);
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

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
        height: max-content;
    }

    .key_disp{
        margin: 30px auto;
        font-size: 12px;
    }

    a{
        color: #1D82BB !important;
    }

    .cols{
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 60px;
    }

    .phrase_disp_col{
        padding: 0px 30px;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        > *{
            width: 100%;
        }
    }

    .phrase_raw{
        background-color: #e5ecff;
        padding: 14px 24px;
        text-align: justify;
        border-radius: 4px;
        margin: 30px 0px !important;
        /*margin-bottom: 60px !important;*/
    }

    .stage_2{
        width: 100%;
        text-align: left;
        align-items: start;
    }

    .tips p{
        margin-bottom: 30px !important;
    }

    .warn{
        /*color: #999;*/
        font-size: 22px;
        margin: 14px 0px !important;
        margin-top: 30px !important;
    }

    .access{
        margin: 0px 0px;
        margin-top: 30px;
    }

    .access_cont{
        text-align: right;
        /*display: flex;*/
        /*justify-content: flex-end;*/
        flex-direction: column;
        /*align-items: center;*/
    }

    .mnemonic_disp{
        max-width: 560px;
        justify-self: center;
        display: flex;
        flex-direction: column;

        button{
            margin: 15px auto;
            width: max-content;
        }
    }

    .copy_phrase{
        /*width: 20px;*/
        /*height: 20px;*/
        margin: 0px auto;
    }
    @include main.mobile-device{
        .access{
            margin: 30px auto;
            width: 100%;
        }
        .stage_2{
            padding: main.$container_padding_mobile;
        }
        .cols{
            display: block;
        }
        .phrase_disp_col{
            /*display: none;*/
            padding: 30px 0px;
        }

        .mnemonic_disp{
            margin: 0px auto;
        }
    }
</style>
