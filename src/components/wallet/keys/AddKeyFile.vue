<template>
    <div class="add_key_file">
        <label>Keystore File</label>
        <file-input @change="onfile" class="formIn"></file-input>
        <label>Password</label>
        <v-text-field class="formIn" placeholder="Password" dense
                      outlined color="#4C2E56" hide-details
                      type="password" v-model="pass"></v-text-field>
        <p v-if="err" class="err">{{err}}</p>
        <v-btn
                class="addKeyBut but_primary"
                depressed
                @click="importKeyfile"
                color="#4C2E56"
                block
                :disabled="!canSubmit"
                :loading="isLoading"
        >Import Wallet</v-btn>
    </div>
</template>
<script>
    import { QrInput } from '@avalabs/vue_components';
    import {bintools, keyChain} from "@/AVA";
    import FileInput from "@/components/misc/FileInput";

    export default {
        components: {
            QrInput,
            FileInput
        },
        data(){
            return {
                pass: "",
                err: null,
                canAdd: false,
                keyfile: null,
                isLoading: false,
            }
        },
        computed: {
            canSubmit(){
                let file = this.keyfile;
                let pass = this.pass;
                if(file && pass){
                    return  true;
                }
                return false;
            }
        },
        methods: {
            onfile(val){
                this.keyfile = val;
            },
            qr_change(val){
                // this.pk = val;
                if(this.pk.length>10){
                    this.canAdd = true
                }else{
                    this.canAdd = false;
                }
            },
            importKeyfile(){
                let parent = this;
                this.isLoading = true;
                this.err = null;

                setTimeout(()=> {
                    parent.$store.dispatch('importKeyfile', {
                        password: parent.pass,
                        file: parent.keyfile
                    }).then(res => {
                        parent.isLoading = false;
                        parent.clear();
                    }).catch(err => {
                        parent.isLoading = false;
                        this.err = err.message;
                        parent.$store.dispatch('Notifications/add', {
                            type: 'error',
                            title: 'Import Failed',
                            message: err.message
                        })
                    });
                }, 500)

            },

            clear(){
                this.pass = "";
            }
        }
    }
</script>
<style lang="scss">
    .add_key_file{
        fieldset{
            border: none !important;
        }
    }
</style>
<style scoped lang="scss">
@use '../../../main';

    .addKeyBut{
        color: #fff;
        text-transform: none;
        border-radius: 2px;
    }

    .v-btn{
        margin-top: 6px;
    }

    label{
        font-size: 12px;
        color: main.$primary-color-light;
    }

    .err{
        color: #f00;
        margin: 4px 0px;
        font-size: 12px;
    }

    .formIn{
        border: none;
        height: 40px;
        font-size: 12px;
        /*border-color: #aaa;*/
        background-color: #F5F6FA;
        border-radius: 2px;


    }
</style>
