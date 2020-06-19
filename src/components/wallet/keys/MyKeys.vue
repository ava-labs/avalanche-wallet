<template>
    <div class="my_keys">
        <v-alert type="info" v-if="rememberKey" text>
            Your private keys are remembered until you close this tab or logout of your wallet.
        </v-alert>
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
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import KeyRow from "@/components/wallet/keys/KeyRow.vue";
    import AvaHdWallet from "@/js/AvaHdWallet";


    @Component({
        components: {
            KeyRow
        }
    })
    export default class MyKeys extends Vue{
        selectWallet(wallet: AvaHdWallet){
            this.$store.dispatch('activateWallet', wallet);
            this.$store.dispatch('History/updateTransactionHistory');
        }
        async removeWallet(wallet: AvaHdWallet){

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

        get rememberKey(){
            return this.$store.state.rememberKey;
        }

        get wallets():AvaHdWallet[]{
            let res = [];
            let wallets =  this.$store.state.wallets;

            for(var i=0;i<wallets.length;i++){
                let wallet = wallets[i];
                if(wallet !== this.activeWallet){
                    res.push(wallet)
                }
            }
            return res;
        }

        get activeWallet(){
            return this.$store.state.activeWallet;
        }

        get balance(){
            return this.$store.state.Assets.assetsDict;
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


</style>
