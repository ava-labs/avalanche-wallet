<template>
    <modal ref="modal" title="Extended Public Key (Beta)" class="modal_main">
        <div class="singleton_modal_body">
            <p>This extended public key is used to derive all your X and P chain addresses.</p>
            <p class="key_raw">
                Path:
                <b>m/44'/9000'/0'</b>
                <br />
                <br />
                {{ xpub }}
            </p>
            <p class="warning_text">
                Warning: This extended public key can be used to derive your wallet's addresses and
                should be shared with caution.
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
export default class XpubModal extends Vue {
    @Prop({ default: '' }) xpub!: string

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
