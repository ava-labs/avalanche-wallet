<template>
    <modal ref="modal" :title="$t('modal.pub_key.title')" class="modal_main">
        <div class="singleton_modal_body">
            <p class="key_raw">
                {{ publicKey }}
            </p>
            <CopyText
                :tooltip="$t('top.hover3')"
                :value="publicKey"
                class="copy_but"
                :notificationMessage="$t('notifications.copy_public_key')"
            ></CopyText>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import CopyText from '@/components/misc/CopyText.vue'

@Component({
    components: {
        Modal,
        CopyText,
    },
})
export default class PublicKey extends Vue {
    @Prop({ default: '' }) publicKey!: string

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
    padding: 10px 0px 0px 0px;
    display: flex;
    align-items: center;
    > * {
        opacity: 0.8;
        background-size: contain;
        background-position: center;
        &:hover {
            opacity: 1;
        }
    }
    .v-icon {
        color: var(--primary-color);
        width: 18px;
        height: 18px;
        font-size: 22px;
    }
}
.copy_but {
    color: var(--primary-color);
}
.key_raw {
    display: flex;
    text-align: left;
    word-break: break-all;
    background-color: var(--bg);
    opacity: 1;
    margin: 15px 0px !important;
    border-radius: 2px;
    padding: 0px 12px;
}
</style>
