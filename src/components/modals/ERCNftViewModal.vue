<template>
    <modal :title="$t('modal.nft.title')" ref="modal">
        <div class="nft_view_body">
            <ERCNftView :token="token" :index="index" class="view"></ERCNftView>
        </div>
    </modal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import ERCNftView from '../misc/ERCNftView.vue'
import ERCNftToken from '@/js/ERCNftToken'
import { ERCNftBalance } from '@/store/modules/assets/modules/types'
@Component({
    components: { ERCNftView, Modal },
})
export default class ERCNftViewModal extends Vue {
    @Prop() token!: ERCNftToken
    @Prop() index!: ERCNftBalance

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
    margin: auto;
}

.view {
    height: 100%;
    width: 100%;
}
</style>
