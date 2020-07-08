<template>
    <div class="create_wallet">
        <b-container>
            <b-row>
                <b-col>
                    <transition name="fade" mode="out-in">
                        <div v-if="!newPrivateKey" class="stage_1">
                            <div class="img_container">
                                <img src="@/assets/diamond-secondary.png" alt />
                            </div>
                            <h1>Generate a new key phrase to use with your wallet.</h1>
                            <router-link to="/access" class="link">Already have a wallet?</router-link>
                            <div class="options">
                                <button class="ava_button but_generate" @click="createKey">Generate Key Phrase</button>
                                <p>or</p>
                                <TorusGoogle class="torus_but"></TorusGoogle>
                            </div>

                            <router-link to="/" class="link">Cancel</router-link>
                        </div>

                        <div v-else class="stage_2">
                            <div class="cols">
                                <div class="mneumonic_disp_col">
                                    <div class="mnemonic_disp">
                                        <mnemonic-display :phrase="keyPhrase" :bgColor="'#F5F6FA'"></mnemonic-display>
                                        <p class="phrase_raw">{{keyPhrase}}</p>
                                        <div class="mneumonic_button_container">
                                            <CopyText
                                                    :value="keyPhrase"
                                                    class="ava_button copy_phrase"
                                            >Copy Key Phrase</CopyText>
                                            <button @click="createKey" class="ava_button but_randomize">
                                                <fa icon="sync"></fa>
                                                <span>Randomize</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="phrase_disp_col">
                                    <img src="@/assets/keyphrase.png" alt />
                                    <header>
                                        <h1>This is your 24 word key phrase.</h1>
                                        <p>You will use these words to access your wallet.</p>
                                    </header>
                                    <p class="warn">
                                        <span class="label">Attention!</span>
                                        <span class="description">Store this key phrase in a secure location. Anyone with this key phrase can access your wallet. There is no way to recover lost key phrases!</span>
                                    </p>
                                    <div class="access_cont">
                                        <remember-key
                                                v-model="rememberPassword"
                                                @is-valid="isRememberValid"
                                                complete="onremember"
                                                explain="Remember my wallet."
                                        ></remember-key>
                                        <div class="submit">
                                            <transition name="fade" mode="out-in">
                                                <Spinner v-if="isLoad" class="spinner" color="#000"></Spinner>
                                                <div v-else>
                                                    <button
                                                            class="ava_button access generate"
                                                            @click="access"
                                                            :disabled="!canSubmit"
                                                    >Access Wallet</button>
                                                    <router-link to="/" class="link">Cancel</router-link>
                                                </div>
                                            </transition>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </b-col>
            </b-row>
        </b-container>

        <div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import TextDisplayCopy from "@/components/misc/TextDisplayCopy.vue";
    import Spinner from '@/components/misc/Spinner.vue';
    import {keyChain} from "@/AVA";
    import RememberKey from "@/components/misc/RememberKey.vue";
    import {Buffer} from "buffer/";

    import TorusGoogle from "@/components/Torus/TorusGoogle.vue";
    // import Torus from "@/components/access/Torus.vue";

    import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
    import CopyText from "@/components/misc/CopyText.vue";

    import * as bip39 from 'bip39';

    import {KeyPair} from "avalanche";

    @Component({
        components: {
            CopyText,
            RememberKey,
            TextDisplayCopy,
            MnemonicDisplay,
            Spinner,
            TorusGoogle
        }
    })
    export default class CreateWallet extends Vue{
        isLoad: boolean = false;
        rememberPassword:string|null = null;
        rememberValid:boolean = true;         // Will be true if the values in remember wallet checkbox are valid
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

        // Will be true if the values in remember wallet checkbox are valid
        isRememberValid(val: boolean){
            this.rememberValid = val;
        }

        get canSubmit():boolean{
            if(!this.rememberValid) return false;
            return true;
        }
        async access(): Promise<void> {
            if (!this.keyPair) return;

            this.isLoad = true;

            let parent = this;

            setTimeout(async ()=>{
                await parent.$store.dispatch('accessWallet', this.keyPair);

                if(this.rememberPassword && this.rememberValid){
                    console.log("Will remember..");
                    parent.$store.dispatch('rememberWallets', this.rememberPassword);
                }

                //@ts-ignore
                // console.log(parent.$refs)
                // parent.$refs.remember_wallet.save();
                // if(password){
                //     console.log("will remember")
                //     let payload:rememberWalletIn = {
                //         wallets: [wallet],
                //         password: password
                //     }
                //     parent.$store.dispatch('rememberWallets', payload);
                // }
            }, 500);

        }
    }
</script>
<style scoped lang="scss">
@use '../../main';

.create_wallet {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* ==========================================
   stage_1
   ========================================== */

.stage_1 {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background-color: main.$background-color;
    padding: main.$container-padding;
    text-align: center;
    /*min-width: 1000px;*/

    img {
        margin-top: main.$vertical-padding;
        width: 89px;
        height: 89px;
        max-height: none;
    }

    h1 {
        margin-top: main.$vertical-padding;
        text-align: left;
        font-size: main.$m-size;
        font-weight: 400;
    }


}

.options{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 30px;

    p{
        color: #999;
        margin: 6px !important;
    }
}

.torus_but{
    background-color: #db3236;
}


.but_generate {
    display: block;
    height: max-content;
    background-color: main.$secondary-color;
}


.key_disp {
    margin: 30px auto;
    font-size: 12px;
}

a {
    color: main.$primary-color-light !important;
    text-decoration: underline !important;
    margin-top: 10px;
}

/* ==========================================
   mneumonic
   ========================================== */

.stage_2 {
    margin: 0 auto;
    text-align: left;
    align-items: start;
}

.cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 60px;
}


.stage_1, .stage_2{
    /*padding: 30px;*/
}

.mneumonic_disp_col {
    .mnemonic_disp {
        max-width: 560px;
        justify-self: center;
        display: flex;
        flex-direction: column;
    }

    .phrase_raw {
        color: main.$primary-color;
        background-color: main.$secondary-color-extra-light;
        padding: 14px 24px;
        text-align: justify;
        border-radius: 4px;
        margin: 30px 0px !important;
    }

    .mneumonic_button_container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;

        .copy_phrase {
            margin-right: 15px;
            background-color: main.$secondary-color-light;
        }

        .but_randomize {
            width: max-content;
            color: main.$secondary-color-light !important;
            background-color: main.$white;

            span {
                margin-left: 12px;
            }
        }
    }
}

.phrase_disp_col {
    padding: 0 30px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    > * {
        width: 100%;
    }

    img {
        width: main.$img-size;
        height: main.$img-size;
        max-height: none;
    }

    header {
        h1 {
            margin-top: 10px;
            font-size: main.$xl-size;
            line-height: 1.25em;
            font-weight: 400;
        }

        p {
            color: main.$primary-color-light;
        }
    }

    .warn {
        margin-top: main.$vertical-padding !important;

        span {
            display: block;
            font-size: main.$s-size;
            font-weight: 700;
            text-transform: uppercase;

            &.label {
                color: main.$secondary-color;
                text-transform: uppercase;
            }

            &.description {
                color: main.$primary-color-light !important;
            }
        }
    }

    .access_cont {
        text-align: right;
        flex-direction: column;

        .submit {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;

            .access {
                background-color: main.$primary-color !important;
            }

            .link {
                margin-left: 40px;
            }
        }
    }
}

.spinner{
    width: 26px !important;
    margin: 0px auto;
}



@include main.medium-device {
    .stage_1 {
        min-width: unset;
    }
}

@include main.mobile-device {
    .stage_1 {
        /*padding: 0;*/
        min-width: unset;
    }

    .stage_2 {
        /*padding: 0;*/
        min-width: unset;
    }

    .access {
        margin: 30px auto;
        width: 100%;
    }

    .cols {
        display: block;
    }

    .options{
        margin: 30px 0px;

        > button{
            width: 100%;
        }
    }

    .mneumonic_disp_col {
        .mnemonic_disp {
            margin: 0 auto;
        }

        .mneumonic_button_container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .copy_phrase {
                margin-right: 0;
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: center;
            }

            .but_randomize {
                margin-top: 10px;

                span {
                    margin-left: 12px;
                }
            }
        }
    }

    .phrase_disp_col {
        padding: 30px 0;
        align-items: center;

        img {
            width: main.$img-size-mobile;
            height: main.$img-size-mobile;
        }

        header {
            h1 {
                font-size: main.$xl-size-mobile;
            }
        }

        .warn {
            margin-top: main.$vertical-padding-mobile !important;
        }

        .access_cont {
            .submit {
                flex-direction: column;
                justify-content: center;

                > div {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .link {
                    margin: auto;
                }
            }
        }
    }
}
</style>
