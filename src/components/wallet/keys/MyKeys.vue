<template>
    <div class="my_keys">
        <v-alert type="info" v-if="rememberKey" text>
            Your private keys are remembered until you close this tab or logout of your wallet.
        </v-alert>
        <key-row :wallet="activeWallet"
                 class="key_row"
                 :is_default="true"
        ></key-row>
        <hr>
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
        removeWallet(wallet: AvaHdWallet){

            let msg = this.$t('keys.del_check') as string;
            let isConfirm = confirm(msg);

            if(isConfirm){
                // this.$store.dispatch('removeKey', addr)
                this.$store.commit('removeWallet', wallet)
                this.$store.dispatch('Notifications/add', {
                    title: 'Key Removed',
                    message: 'Private key and assets removed from the wallet.'
                });

                if(this.rememberKey){
                    this.$store.dispatch('saveKeys');
                }
            }
        }



        get rememberKey(){
            return this.$store.state.rememberKey;
        }
        // get selected(){
        //     return this.$store.state.selectedAddress;
        // }
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
        // non default addresses
        // get addresses(){
        //     let res = [];
        //     let allAddr = this.$store.state.addresses;
        //
        //     for(var i=0; i<allAddr.length; i++){
        //         let addr = allAddr[i];
        //         if(addr !== this.selected){
        //             res.push(addr);
        //         }
        //     }
        //     return res;
        // }
        get balance(){
            return this.$store.state.Assets.assetsDict;
        }
    }

    // export default {
    //     components: {
    //         KeyRow,
    //     },
    //     methods: {
    //         selectKey(addr){
    //             this.$store.commit('selectAddress', addr);
    //             this.$store.dispatch('History/updateTransactionHistory');
    //         },
    //         removeKey(addr){
    //
    //             let msg = this.$t('keys.del_check');
    //             let isConfirm = confirm(msg);
    //
    //             if(isConfirm){
    //                 this.$store.dispatch('removeKey', addr)
    //             }
    //
    //             if(this.rememberKey){
    //                 this.$store.dispatch('saveKeys');
    //             }
    //         }
    //     },
    //     computed: {
    //         rememberKey(){
    //             return this.$store.state.rememberKey;
    //         },
    //         selected(){
    //             return this.$store.state.selectedAddress;
    //         },
    //         wallets(){
    //             return this.$store.state.wallets;
    //         },
    //         // non default addresses
    //         addresses(){
    //             let res = [];
    //             let allAddr = this.$store.state.addresses;
    //
    //             for(var i=0; i<allAddr.length; i++){
    //                 let addr = allAddr[i];
    //                 if(addr !== this.selected){
    //                     res.push(addr);
    //                 }
    //             }
    //             return res;
    //         },
    //         balance(){
    //             return this.$store.state.Assets.assetsDict;
    //         },
    //
    //     }
    // }
</script>
<style scoped lang="scss">

    .default_key{

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
        /*border-bottom: 1px solid #EAEDF4;*/
        /*border-radius: 14px;*/


        &[selected]{
            /*border-color: #2960CD;*/
            /*background-color: #edf3ff;*/
        }
    }


</style>
