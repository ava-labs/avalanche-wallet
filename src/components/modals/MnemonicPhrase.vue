<template>
    <modal ref="modal" title="Key Phrase" class="modal_main">
        <div class="mnemonic_modal_body">
            <mnemonic-display :phrase="phrase" :row-size="3"></mnemonic-display>
            <p class="phrase_raw">{{phrase}}</p>
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
    }
</script>
<style scoped lang="scss">
    .mnemonic_modal_body{
        /*width: 600px;*/
        width: 400px;
        max-width: 100%;
        padding: 30px;
        background-color: var(--bg-light);
    }

    .copyBut{
        width: 20px;
        height: 20px;
        margin: 15px auto;
        margin-bottom: 0;
    }

    .phrase_raw{
        background-color: var(--bg);
        margin: 15px 0px !important;
        border-radius: 2px;
        padding: 6px 12px;
    }
</style>
