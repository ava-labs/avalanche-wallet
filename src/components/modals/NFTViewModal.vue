<template>
    <modal :title="$t('modal.nft.title')" ref="modal">
        <div class="nft_view_body">
            <NftPayloadView :payload="payload" class="view"></NftPayloadView>
        </div>
    </modal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
@Component({
    components: { NftPayloadView, Modal },
})
export default class NFTViewModal extends Vue {
    @Prop() payload!: PayloadBase

    $refs!: {
        modal: Modal
    }

    open() {
        this.$refs.modal.open()
    }
}
</script>
<style scoped lang="scss">
.nft_view_body {
    width: 80vw;
    height: 80vh;
}

.view {
    height: 100%;
    width: 100%;
}
</style>
