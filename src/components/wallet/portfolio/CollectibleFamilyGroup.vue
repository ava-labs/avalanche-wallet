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
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from 'avalanche/dist/utils'
import { Buffer } from 'avalanche'
import { PayloadTypes } from 'avalanche/dist/utils'
import Tooltip from '@/components/misc/Tooltip.vue'
import NFTViewModal from '@/components/modals/NFTViewModal.vue'
import NftCard from '@/components/wallet/portfolio/NftCard.vue'

let payloadtypes = PayloadTypes.getInstance()
@Component({
    components: { NftCard, NFTViewModal, Tooltip, NftPayloadView },
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
@use '../../../main';

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
    //border-radius: 14px;
    overflow: auto;
    //box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
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
