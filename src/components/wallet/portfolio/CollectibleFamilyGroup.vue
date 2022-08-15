<template>
    <div class="family_group">
        <NftCard
            :payload="payload"
            :utxo="utxos[0]"
            :group-i-d="groupID"
            :quantity="quantity"
        ></NftCard>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NFTTransferOutput, UTXO } from '@c4tplatform/camino/dist/apis/avm'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import { Buffer } from '@c4tplatform/camino'
import { PayloadTypes } from '@c4tplatform/camino/dist/utils'
import NFTViewModal from '@/components/modals/NFTViewModal.vue'
import NftCard from '@/components/wallet/portfolio/NftCard.vue'

let payloadtypes = PayloadTypes.getInstance()
@Component({
    components: { NftCard, NFTViewModal },
})
export default class CollectibleFamilyGroup extends Vue {
    @Prop() utxos!: UTXO[]
    $refs!: {
        modal: NFTViewModal
    }

    get quantity() {
        return this.utxos.length
    }

    get groupID() {
        let output = this.utxos[0].getOutput() as NFTTransferOutput
        return output.getGroupID()
    }

    get payload(): PayloadBase {
        let out = this.utxos[0].getOutput() as NFTTransferOutput
        let payload = out.getPayloadBuffer()

        let typeId = payloadtypes.getTypeID(payload)
        let pl: Buffer = payloadtypes.getContent(payload)
        let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

        return payloadbase
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.family_group {
    position: relative;
}

.back {
    backface-visibility: hidden;
    transform: rotateY(180deg);
    background-color: var(--bg-light);
}

.front {
    max-height: 100%;
    height: 100%;
    z-index: 1;
}

.front,
.back {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: auto;
}

.back {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

@include main.mobile-device {
}
</style>
