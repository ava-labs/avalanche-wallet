<template>
    <div class="my_keys">
        <p class="label">Active Key</p>
        <key-row :wallet="activeWallet"
                 class="key_row"
                 :is_default="true"
        ></key-row>
        <hr>
        <p class="label" v-if="wallets.length>0">Other Keys</p>
        <transition-group name="fade">
            <key-row v-for="wallet in wallets"
                     :wallet="wallet"
                     :key="wallet.masterKey.getAddressString()"
                     class="key_row"
                     @select="selectWallet"
                     @remove="removeWallet"
            ></key-row>
        </transition-group>

        <div v-if="hasVolatile" class="volatile_cont">
            <v-alert type="error"  text class="alert_box">
                You have volatile keys in your wallet that will be forgotten when you refresh or close this page.
                <br><br>
                If you want the browser to remember all of your keys please click <b>Remember Keys</b> and save your keys with a password.
            </v-alert>
            <RememberKey v-model="volatilePass" @is-valid="isVolatileRememberValid" class="remember_comp" ></RememberKey>
            <v-btn :disabled="!canRememberVolatile" class="ava_button remember_but" color="#4C2E56" depressed @click="rememberVolatile">Save Keys</v-btn>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import KeyRow from "@/components/wallet/manage/KeyRow.vue";
    import RememberKey from "@/components/misc/RememberKey.vue";
    import {AvaWallet} from "@/js/AvaWallet";


    @Component({
        components: {
            KeyRow,
            RememberKey
        }
    })
    export default class MyKeys extends Vue{
        volatilePass: string = "";
        volatileRememberValid: boolean = false;

        isVolatileRememberValid(val: boolean){
            this.volatileRememberValid = val;
        }

        get canRememberVolatile(){
            if(!this.volatilePass || !this.volatileRememberValid) return false;
            return true;
        }

        rememberVolatile(){
            let pass = this.volatilePass;
            this.$store.dispatch('rememberWallets', pass)
        }


        selectWallet(wallet: AvaWallet){
            this.$store.dispatch('activateWallet', wallet);
            this.$store.dispatch('History/updateTransactionHistory');
        }
        async removeWallet(wallet: AvaWallet){

            let msg = this.$t('keys.del_check') as string;
            let isConfirm = confirm(msg);

            if(isConfirm){
                await this.$store.dispatch('removeWallet', wallet);
                this.$store.dispatch('Notifications/add', {
                    title: 'Key Removed',
                    message: 'Private key and assets removed from the wallet.'
                });
            }
        }


        get hasVolatile(){
            return this.$store.state.volatileWallets.length > 0;
        }

        get wallets():AvaWallet[]{
            let wallets:AvaWallet[] = this.$store.state.wallets;

            let res = wallets.filter(wallet => {
                if(this.activeWallet === wallet) return false;
                return true;
            });

            return res;
        }

        get activeWallet(){
            return this.$store.state.activeWallet;
        }
    }

</script>
<style scoped lang="scss">

    .default_key{

    }

    .label{
        font-size: 13px;
        color: #999;
        font-weight: bold;
        padding: 2px 10px;
    }
    .key_row{
        background-color: #F5F6FA;
        padding: 15px;
        border-radius: 2px;
        margin-bottom: 10px;
        transition-duration: 0.2s;
    }

    .my_keys{
        padding-top: 15px;
    }
    .addressItem {
        &[selected]{
        }
    }

    .volatile_cont{
        border-top: 1px solid #eee;
        margin-top: 20px;
        padding-top: 20px;
    }

    .remember_but{
        margin-left: 25px;
    }
    .remember_comp{
        /*padding: 20px 0;*/
    }

    .alert_box{
        margin: 0px 25px;
        font-size: 0.9rem;
    }
</style>
