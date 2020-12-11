<template>
    <modal ref="modal" :title="$t('modal.priv_key.title')" class="modal_main">
        <div class="singleton_modal_body">
            <p class="key_raw">{{ privateKey }}</p>
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
    background-color: var(--bg-light);
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
</style>
