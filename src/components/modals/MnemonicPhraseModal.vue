<template>
    <modal ref="modal" :title="$t('modal.mnemonic.title')" class="modal_main">
        <div class="mnemonic_modal_body">
            <mnemonic-display :phrase="phrase" :row-size="3"></mnemonic-display>
            <p class="warning_text">
                Warning: Never disclose this mnemonic phrase. Anyone with your phrase can steal
                assets held in your wallet.
            </p>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import MnemonicDisplay from '@/components/misc/MnemonicDisplay.vue'
import CopyText from '@/components/misc/CopyText.vue'
import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'

@Component({
    components: {
        Modal,
        MnemonicDisplay,
        CopyText,
    },
})
export default class MnemonicPhraseModal extends Vue {
    @Prop({ default: '' }) phrase!: MnemonicPhrase

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.mnemonic_modal_body {
    /*width: 600px;*/
    max-width: 400px;
    width: 100%;
    padding: 30px;
    background-color: var(--bg-light);
}

.copyBut {
    width: 20px;
    height: 20px;
    margin: 15px auto;
    margin-bottom: 0;
}

.phrase_raw {
    background-color: var(--bg);
    margin: 15px 0px !important;
    border-radius: 2px;
    padding: 6px 12px;
}

.warning_text {
    background-color: var(--secondary-color);
    color: #fff;
    margin-top: 15px !important;
    padding: 4px 14px;
    border-radius: 3px;
}

@include main.mobile-device {
    .mnemonic_modal_body {
        max-width: 100%;
    }
}
</style>
