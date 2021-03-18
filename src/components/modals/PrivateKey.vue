<template>
    <modal ref="modal" :title="$t('modal.priv_key.title')" class="modal_main">
        <div class="singleton_modal_body">
            <p class="key_raw">{{ privateKey }}</p>
            <p class="warning_text">
                Warning: Never disclose this key. Anyone with your private keys can steal any assets
                held in your wallet.
            </p>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'

@Component({
    components: {
        Modal,
    },
})
export default class PrivateKey extends Vue {
    @Prop({ default: '' }) privateKey!: string

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }
}
</script>
<style scoped lang="scss">
.singleton_modal_body {
    width: 520px;
    max-width: 100%;
    padding: 10px 20px;
}

.copyBut {
    width: 20px;
    height: 20px;
    margin: 15px auto;
    margin-bottom: 0;
}

.key_raw {
    text-align: center;
    word-break: break-all;
    background-color: var(--bg);
    margin: 15px 0px !important;
    border-radius: 2px;
    padding: 6px 12px;
}

.warning_text {
    background-color: var(--secondary-color);
    color: #fff;
    padding: 4px 14px;
    border-radius: 3px;
}
</style>
