<template>
    <Modal ref="modal" :can_close="false" title="Activate Wallet">
        <div class="remember_modal">
            <p>There is an active wallet. Enter your password to access it. </p>
            <form @submit.prevent="onsubmit">
                <input type="password" placeholder="Password" v-model="password" class="password">
                <p class="err">{{err}}</p>
                <v-btn type="submit" :loading="isLoading" depressed color="#4C2E56" class="ava_button submit">Access Wallet</v-btn>
                <button @click="cancel" class="cancel_but">Access another wallet</button>
            </form>
        </div>
    </Modal>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import Modal from "../Modal.vue";
    import {KeyFile} from "@/js/IKeystore";
    import {readKeyFile} from "@/js/Keystore";
    import {AVMKeyPair} from "avalanche";
    import {avm} from "@/AVA";
    import {keyToKeypair} from "@/helpers/helper";
    @Component({
        components: {Modal}
    })
    export default class RememberWalletModal extends Vue {
        password: string = "";
        isLoading: boolean = false;
        err: string = "";
        mounted(){
            let w = localStorage.getItem('w');

            if(w){
                this.open();
            }
        }

        async onsubmit(){
            this.isLoading = true;
            this.err = "";
            let w = localStorage.getItem('w');
            if(!w) return;

            let pass = this.password;
            let fileData: KeyFile = JSON.parse(w);

            try{
                let rawData = await readKeyFile(fileData, pass);
                let keys = rawData.keys;
                this.isLoading = false;

                let chainID = avm.getBlockchainAlias() || avm.getBlockchainID();
                let inputData:AVMKeyPair[] = keys.map(key => {
                    return keyToKeypair(key.key, chainID);
                });
                await this.$store.dispatch('accessWalletMultiple', inputData);

                // These are not volatile wallets since they are loaded from storage
                this.$store.state.volatileWallets = [];
                this.close();
            }catch(e){
                this.isLoading = false;
                if(e === "INVALID_PASS"){
                    this.err = "Invalid password."
                }else{
                    this.err = "Unable to read wallet data."
                }
                return;
            }
        }

        cancel(){
            localStorage.removeItem('w');
            this.close();
        }

        close(){
            //@ts-ignore
            this.$refs.modal.close();
        }

        open(){
            //@ts-ignore
            this.$refs.modal.open();
        }
    }
</script>
<style scoped lang="scss">
    @use '../../../main';

    .remember_modal{
        padding: 30px;
    }

    form{
        display: flex;
        flex-direction: column;

        > * {
            margin: 6px 0px;
        }
    }

    .cancel_but{
        color: #999;
        font-size: 0.9rem;
    }

    .password{
        background-color: #f5f6fa;
        padding: 6px 14px;
    }

    .submit{
        margin-top: 30px;
    }

    .err{
        color: main.$secondary-color;
    }
</style>