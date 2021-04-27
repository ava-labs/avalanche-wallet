<template>
    <modal :title="$t('modal.nft.title')" ref="modal">
        <div class="nft_view_body">
            <ERC721View :token="token" :index="tokenId" class="view"></ERC721View>
        </div>
    </modal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import ERC721View from '../misc/ERC721View.vue'
import ERC721Token from '@/js/ERC721Token'
@Component({
    components: { ERC721View, Modal },
})
export default class ERC721ViewModal extends Vue {
    @Prop() token!: ERC721Token
    @Prop() tokenId!: string

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
