<template>
    <modal ref="modal" :title="$t('modal.priv_key.title')" class="modal_main">
        <div class="singleton_modal_body">
            <p class="key_raw" data-cy="private-key-display">{{ privateKey }}</p>
            <p class="warning_text">
                Warning: Never disclose this key. Anyone with your private keys can steal any assets
                held in your wallet.
            </p>
            <template v-if="publicKey">
                <div class="key_raw">
                    Public Key
                    <br />
                    {{ publicKey }}
                </div>
                <div class="key_raw">
                    Compressed Public Key
                    <br />
                    {{ compressedPublicKey }}
                </div>
            </template>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
const ecdsa = require('elliptic').ec
const ec = new ecdsa('secp256k1')

@Component({
    components: {
        Modal,
    },
})
export default class PrivateKey extends Vue {
    @Prop({ default: '' }) privateKey!: string
    @Prop({ default: '' }) publicKey!: string

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    get compressedPublicKey(): string {
        return Buffer.from(
            ec
                .keyFromPublic(Buffer.from(this.publicKey, 'hex'))
                .getPublic(true, 'hex')
                .padStart(66, '0'),
            'hex'
        ).toString('hex')
    }
}
</script>
<style scoped lang="scss">
.singleton_modal_body {
    width: 520px;
    max-width: 100%;
    padding: 10px 0px 0px 0px;
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
    margin: 12px 0px !important;
    border-radius: 2px;
}

.warning_text {
    background-color: var(--secondary-color);
    color: #fff;
    padding: 4px 14px;
    border-radius: 3px;
}
</style>
