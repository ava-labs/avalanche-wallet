<template>
    <div>
        <label>{{$t('private_key')}}</label>
        <form @submit.prevent="addKey">
            <qr-input @change="validateQR" v-model="privateKeyInput" class="qrIn"></qr-input>
            <p class="err">{{error}}</p>
            <v-btn
                type="submit"
                :loading="isLoading"
                :disabled="!canAdd"
                class="addKeyBut ava_button"
                depressed block
                color="#4C2E56"
            >{{$t('add_pk')}}</v-btn>
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
    // import { AVMKeyPair } from 'avalanche';
    import {AVMKeyPair} from "avalanche/dist/apis/avm";

    @Component({
        components: {
            QrInput,
            Spinner
        }
    })
    export default class AddKeyString extends Vue {
        privateKeyInput: string = "";
        canAdd: boolean = false;
        error: string = "";
        isLoading: boolean = false;

        validateQR(val: string) {
            if (this.privateKeyInput.length > 10) {
                this.canAdd = true
            } else if (this.privateKeyInput.length === 0) {
               this.error = "";
            } else {
                this.canAdd = false;
            }
        }

        addKey() {
            this.isLoading = true;
            this.error = "";

            setTimeout(async () => {
                try {
                    let chainID = avm.getBlockchainAlias() || avm.getBlockchainID();
                    let keyPair:AVMKeyPair = keyToKeypair(this.privateKeyInput, chainID);
                    await this.$store.dispatch("addWallet", keyPair);
                    // @ts-ignore
                    this.$emit("success");
                    this.clear();
                } catch (e) {
                    this.isLoading = false;
                    this.error = "Invalid Private Key";
                }
            }, 200);
        }

        clear() {
            this.isLoading = false;
            this.privateKeyInput = "";
            this.canAdd = false;
            this.error = "";
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
        color: var(--error);
    }
</style>
