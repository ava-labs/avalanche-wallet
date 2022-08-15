<template>
    <Modal ref="modal" title="Select a Collectible">
        <div class="nft_sel_body">
            <div class="list">
                <CollectibleFamily
                    v-for="fam in nftFamsDict"
                    :family="fam"
                    :key="fam.id"
                    :disabled-ids="disabledIds"
                    @select="select"
                ></CollectibleFamily>
            </div>
        </div>
    </Modal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
import { NftFamilyDict } from '@/store/modules/assets/types'
import CollectibleFamily from '@/components/misc/BalancePopup/CollectibleFamily.vue'
@Component({
    components: { CollectibleFamily, Modal },
})
export default class AvmNftSelectModal extends Vue {
    $refs!: {
        modal: Modal
    }
    @Prop({ default: [] }) disabledIds!: string[]

    open() {
        this.$refs.modal.open()
    }
    close() {
        this.$refs.modal.close()
    }

    select(nft: UTXO) {
        this.$emit('select', nft)
        this.close()
    }

    get isEmpty(): boolean {
        // return this.$store.getters.walletNftUTXOs.length === 0
        return this.$store.state.Assets.nftUTXOs.length === 0
    }

    get nftFamsDict(): NftFamilyDict {
        return this.$store.state.Assets.nftFamsDict
    }

    isNftUsed(utxo: UTXO) {
        return this.disabledIds.includes(utxo.getUTXOID())
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
.nft_sel_body {
    width: 650px;
    max-width: 100%;
}

.list {
    max-height: 60vh;
    overflow: scroll;

    > div {
        border-bottom: 2px solid var(--bg-light);
        padding: 14px;
    }
}

@include main.mobile-device {
    .nft_sel_body {
        width: 100%;
    }
}
</style>
