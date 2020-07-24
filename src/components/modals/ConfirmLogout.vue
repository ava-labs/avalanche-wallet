<template>
    <modal ref="modal" title="Confirm Logout" class="modal_main" :can_close="false">
        <div class="confirm_body">
            <p style="text-align: center">
                Are you sure you want to log out?
                <br>
                This wallet and its keys will be forgotten.
            </p>
            <div style="display: flex;flex-direction: column; align-items: center; margin-top: 14px;">
                <button class="ava_button button_primary" @click="submit">Logout</button>
                <button class="ava_button_secondary" @click="close">Cancel</button>
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import Modal from '@/components/modals/Modal.vue';
    import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
    import CopyText from "@/components/misc/CopyText.vue";

    @Component({
        components: {
            Modal,
            MnemonicDisplay,
            CopyText
        }
    })
    export default class MnemonicPhrase extends Vue{
        @Prop({default: ""}) phrase!: string;

        open():void{
            let modal = this.$refs.modal as Modal;
            modal.open();
        }

        close():void{
            let modal = this.$refs.modal as Modal;
            modal.close();
        }

        submit(){
            this.$store.dispatch("logout");
        }
    }
</script>
<style scoped lang="scss">
    .confirm_body{
        /*width: 600px;*/
        width: 400px;
        max-width: 100%;
        padding: 30px;
        background-color: var(--bg-light);
    }

</style>
