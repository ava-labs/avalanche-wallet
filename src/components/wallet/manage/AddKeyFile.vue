<template>
    <div class="add_key_file">
        <label>Keystore File</label>
        <form @submit.prevent="importKeyfile">
            <file-input @change="onfile" class="formIn"></file-input>
            <label>Password</label>
            <v-text-field class="formIn" placeholder="Password" dense
                        outlined color="#4C2E56" hide-details
                        type="password" v-model="pass"></v-text-field>
            <p v-if="err" class="err">{{err}}</p>
            <v-btn
                type="submit"
                :loading="isLoading"
                :disabled="!canSubmit"
                class="addKeyBut but_primary ava_button"
                depressed block
                color="#4C2E56"
            >Import Wallet</v-btn>
        </form>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import FileInput from "@/components/misc/FileInput.vue";

    @Component({
        components: {
            FileInput
        }
    })
    export default class AddKeyFile extends Vue {
        canAdd: boolean = false;
        pass: string = "";
        keyfile: File | null = null;
        isLoading: boolean = false;
        err: string | null = null;

        get canSubmit(){
            return (this.keyfile && this.pass) ? true : false;
        }

        onfile(val: File) {
            this.keyfile = val;
        }
        
        importKeyfile(){
            this.isLoading = true;
            this.err = null;

            setTimeout(async () => {
                try {
                    await this.$store.dispatch("importKeyfile", {
                        password: this.pass,
                        file: this.keyfile
                    });
                    // @ts-ignore
                    this.$emit("success");
                    this.clear();
                } catch (err) {
                    this.isLoading = false;
                    this.err = err.message;
                    this.$store.dispatch("Notifications/add", {
                        type: "error",
                        title: "Import Failed",
                        message: err.message
                    });
                }    
            }, 200);
        }

        clear() {
            this.isLoading = false;
            this.pass = "";
            this.keyfile = null;
            this.canAdd = false;
            this.err = null;
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
        background-color: #F5F6FA;
        border-radius: 2px;
    }
</style>
