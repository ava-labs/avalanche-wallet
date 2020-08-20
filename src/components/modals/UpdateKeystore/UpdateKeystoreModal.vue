<template>
    <modal ref="modal" title="Update Keystore File" class="modal_main" :can_close="false">
        <div class="update_keystore_modal_body">
            <p>We have upgraded the keystore files. Please download your new keystore file and access the wallet again.</p>
            <ExportWallet v-if="!isSuccess" @success="success" :is-desc="false" class="export_wallet" :wallets="allWallets"></ExportWallet>
            <v-btn v-else class="ava_button button_primary" @click="logout">Logout & Access Again</v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import Modal from '@/components/modals/Modal.vue';
    import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
    import CopyText from "@/components/misc/CopyText.vue";
    import ExportWallet from "@/components/wallet/manage/ExportWallet.vue";
    import AvaHdWallet from "@/js/AvaHdWallet";

    @Component({
        components: {
            Modal,
            MnemonicDisplay,
            CopyText,
            ExportWallet
        }
    })
    export default class MnemonicPhrase extends Vue{
        isSuccess: boolean = false;


        @Prop({default: ""}) phrase!: string;

        open():void{
            let modal = this.$refs.modal as Modal;
            modal.open();
        }

        mounted(){
            this.open();
        }

        success(){
            this.isSuccess = true;
        }

        logout(){
            this.$store.dispatch('logout');
        }

        get allWallets(): AvaHdWallet[]{
            return this.$store.state.wallets;
        }
    }
</script>
<style scoped lang="scss">
    .update_keystore_modal_body{
        /*width: 600px;*/
        width: 400px;
        max-width: 100%;
        padding: 30px;
        /*background-color: var(--bg-light);*/
    }

    .export_wallet{
        margin: 30px 0;
    }

    .ava_button{
        display: block;
        margin: 10px auto !important;
    }
</style>
