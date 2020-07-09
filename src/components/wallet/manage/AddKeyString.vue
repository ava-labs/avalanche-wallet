<template>
    <div>
        <label>{{$t('advanced.paper.privateKey')}}</label>
        <form @submit.prevent="addKey">
            <qr-input @change="validateQR" v-model="privateKey" class="qrIn"></qr-input>
            <p class="err">{{error}}</p>
            <v-btn 
                    type="submit"
                    :loading="isLoading"
                    class="addKeyBut ava_button"
                    depressed
                    :disabled="!canAdd"
                    color="#4C2E56"
                    block
            >Add Private Key
            </v-btn>
        </form>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    // @ts-ignore
    import { QrInput } from '@avalabs/vue_components';
    import Spinner from '@/components/misc/Spinner.vue';
    import {avm, bintools, keyChain} from "@/AVA";
    import {keyToKeypair} from "@/helpers/helper";
    import { AVMKeyPair } from 'avalanche';

    @Component({
        components: {
            QrInput,
            Spinner
        }
    })
    export default class AddKeyString extends Vue {
        privateKey: string = "";
        canAdd: boolean = false;
        error: string = "";
        isLoading: boolean = false;

        validateQR(val: string) {
            if (this.privateKey.length > 10) {
                this.canAdd = true
                // this.isLoading = true;
            } else if (this.privateKey.length === 0) {
               this.error = "";
            } else {
                this.canAdd = false;
            }
        }

        addKey() {
            console.log(this.$store.state.activeWallet);
            console.log("private key", this.$store.state.activeWallet.masterKey.getPrivateKeyString());
            console.log(this.privateKey);
            
            this.isLoading = true;
            console.log("this.isLoading", this.isLoading);

            setTimeout(async () => {
                try {
                    let chainID = avm.getBlockchainAlias() || avm.getBlockchainID();
                    let keyPair:AVMKeyPair = keyToKeypair(this.privateKey, chainID);
                    
                    console.log(keyPair);
                    await this.$store.dispatch('addWallet', keyPair);
                    this.privateKey = "";
                    // @ts-ignore
                    // this.$emit("success"); 
                    console.log("done!");
                    // this.isLoading = false;

                } catch (e) {
                    this.isLoading = false;
                    this.error = "Invalid Private Key";
                }
            }, 200);
        }
    }
</script>
<style scoped lang="scss">
@use '../../../main';

    .addKeyBut {
        text-transform: none;
        background-color: main.$primary-color !important;
    }

    label {
        color: #909090;
        font-size: 12px;
    }

    .qrIn {
        border-radius: 2px !important;
        height: 40px;
        font-size: 12px;
        background-color: #F5F6FA;
    }

    .err{
        color: main.$secondary-color;
    }
</style>
