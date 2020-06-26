<template>
    <div class="export_wallet">
        <p class="explain">{{$t('advanced.export.desc')}} </p>
        <form @submit.prevent="download">
            <label>Password (min 9 characters)</label>
            <v-text-field type="password" class="formIn"
                          v-model="pass" placeholder="Password" hide-details outlined dense  height="40"
            ></v-text-field>
            <label>Confirm Password</label>
            <v-text-field type="password" class="formIn"
                          v-model="passConfirm" hide-details outlined dense height="40" placeholder="Confirm Password"
            ></v-text-field>
            <v-btn depressed :disabled="!isValid" color="#2960CD" block
                   type="submit" :loading="is_loading" class="but_primary">Export Wallet</v-btn>
        </form>

    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    @Component
    export default class ExportWallet extends Vue{
        is_loading: boolean = false;
        pass: string = '';
        passConfirm: string = '';

        get isValid(): boolean{
            if(this.pass.length >= 9 && this.pass===this.passConfirm) return true;
            return false;
        }


        async download(){
            let parent = this;
            this.is_loading = true;

            setTimeout(function(){
                parent.$store.dispatch('exportKeyfile', parent.pass).then( (res) => {
                    parent.is_loading = false;
                    parent.pass = "";
                    parent.$store.dispatch("Notifications/add", {
                        title: "Key File Export" ,
                        message: "Your keys are downloaded."
                    });
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
    .export_wallet{
        font-size: 12px;
    }
    .explain{
        color: #909090;
        margin-bottom: 20px !important;
    }


    label{
        color: #909090;
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
