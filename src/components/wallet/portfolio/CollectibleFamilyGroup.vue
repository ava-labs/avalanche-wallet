<template>
    <div class="family_group" @mouseleave="mouseLeave">
        <p class="count" v-if="quantity > 1">{{ quantity }}</p>
        <div class="nft_card" @click="flip" :flip="isFlip">
            <div class="front">
                <NftPayloadView :payload="payload" class="view"></NftPayloadView>
            </div>
            <div class="back">
                <div class="nft_info">
                    <p>
                        <b>{{ $t('portfolio.collectibles.quantity') }}:</b>
                        {{ quantity }}
                    </p>
                    <p>
                        <b>{{ $t('portfolio.collectibles.group') }}:</b>
                        {{ groupID }}
                    </p>
                </div>
                <v-btn @click="transfer" small>{{ $t('portfolio.collectibles.send') }}</v-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from 'avalanche/dist/utils'
import { Buffer } from 'avalanche'
import { PayloadTypes } from 'avalanche/dist/utils'

let payloadtypes = PayloadTypes.getInstance()
@Component({
    components: { NftPayloadView },
})
export default class CollectibleFamilyGroup extends Vue {
    @Prop() utxos!: UTXO[]
    isFlip = false

    mouseLeave() {
        if (this.isFlip) {
            this.flip()
        }
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

    flip() {
        this.isFlip = !this.isFlip
    }

    transfer(ev: MouseEvent) {
        ev.stopPropagation()

        let utxoId = this.utxos[0].getUTXOID()
        this.$router.push({
            path: '/wallet/transfer',
            query: { nft: utxoId },
        })
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

$countW: 28px;
.count {
    position: absolute;
    top: -$countW/3;
    right: -$countW/3;
    width: $countW;
    height: $countW;
    border-radius: $countW;
    line-height: $countW;
    font-size: 12px;
    text-align: center;
    background-color: var(--primary-color);
    //border: 1px solid var(--bg-wallet);
    color: var(--bg);
    font-weight: bold;
    z-index: 2;
}
.family_group {
    position: relative;
    //background-color: var(--bg-light);
    //min-height: 40px;
}

.nft_card {
    max-height: 100%;
    height: 100%;
    position: relative;
    transform-origin: center;
    transition: all 0.5s ease;
    transform-style: preserve-3d;

    &[flip] {
        transform: rotateY(180deg);
    }
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

.view {
    height: 100%;
}

.front,
.back {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-radius: 14px;
    overflow: auto;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
}

.back {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.nft_info {
    font-size: 12px;
    margin: 30px 0;
}

@include main.mobile-device {
}
</style>
