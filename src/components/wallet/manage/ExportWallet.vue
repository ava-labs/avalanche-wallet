<template>
    <div class="export_wallet">
        <p class="explain">{{$t("advanced.export.desc")}}</p>
        <form @submit.prevent="download">
            <label>Password (min 9 characters)</label>
            <v-text-field
                type="password" placeholder="Password" 
                v-model="pass" 
                hide-details outlined dense 
                class="formIn" height="40"
            ></v-text-field>
            <label>Confirm Password</label>
            <v-text-field 
                type="password" placeholder="Confirm Password" 
                v-model="passConfirm" 
                hide-details outlined dense 
                class="formIn" height="40" 
            ></v-text-field>
            <v-btn 
                type="submit"
                :disabled="!isValid" 
                :loading="isLoading" 
                depressed block 
                color="#4C2E56" 
                class="but_primary ava_button"
            >Export Wallet</v-btn>
        </form>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import AvaHdWallet from "@/js/AvaHdWallet";
    import {ExportWalletsInput} from "@/store/types";

    @Component
    export default class ExportWallet extends Vue{
        isLoading: boolean = false;
        pass: string = "";
        passConfirm: string = "";

        @Prop() wallets!: AvaHdWallet[];

        get isValid(): boolean {
            return (this.pass.length >= 9 && this.pass===this.passConfirm) ? true : false;
        }

        async download() {
            this.isLoading = true;

            let input: ExportWalletsInput = {
                password: this.pass,
                wallets: this.wallets
            }
            setTimeout(() => {
                this.$store.dispatch("exportWallets", input).then(res => {
                    this.isLoading = false;
                    this.pass = "";
                    this.passConfirm = "";
                    this.$store.dispatch("Notifications/add", {
                        title: "Key File Export" ,
                        message: "Your keys are downloaded."
                    });
                    // @ts-ignore
                    this.$emit("success"); 
                });
            }, 200);
        }
    }
</script>
<style lang="scss">
    .export_wallet{
        .formIn{
            .v-input__slot {
                background-color: #F5F6FA;
                border: none !important;
            }

            .v-text-field__details{
                padding: 0;
            }

            fieldset{
                border: none;
            }
        }
    }
</style>
<style lang="scss">
    .export_wallet{
        fieldset{
            border: none !important;
        }
    }
</style>
<style scoped lang="scss">
@use '../../../main';

    .export_wallet{
        font-size: 12px;
    }
    .explain{
        color: main.$primary-color-light;
        margin-bottom: 20px !important;
    }


    label{
        color: main.$primary-color-light;
    }

    .formIn{
        border: none;
        background-color: #f5f6fa;
        font-size: 12px;
        border-radius: 2px;
    }

    .but_primary{
        margin-top: 10px;
        color: #fff;
        text-transform: none;
        border-radius: 2px;
    }
</style>
