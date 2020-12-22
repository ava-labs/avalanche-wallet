<template>
    <div class="family_group">
        <p class="count" v-if="quantity > 1">{{ quantity }}</p>
        <div class="nft_card">
            <NftPayloadView :payload="payload" class="payload_view" small="true"></NftPayloadView>
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
import { NftGroupDict } from '../wallet/portfolio/types'

let payloadtypes = PayloadTypes.getInstance()
@Component({
    components: { NftPayloadView },
})
export default class TxHistoryNftFamilyGroup extends Vue {
    @Prop() payloads!: PayloadBase[]

    get quantity() {
        return this.payloads.length
    }

    get payload(): PayloadBase {
        return this.payloads[0]
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

$countW: 18px;
.count {
    position: absolute;
    top: -$countW/2.5;
    left: -$countW/2.5;
    width: $countW;
    height: $countW;
    border-radius: $countW;
    line-height: $countW;
    font-size: 10px;
    text-align: center;
    background-color: var(--primary-color);
    border: 1px solid var(--bg-wallet);
    color: var(--bg);
    font-weight: bold;
    z-index: 2;
}
.family_group {
    position: relative;
}

.nft_card {
    max-height: 100%;
    height: 100%;
    position: relative;
}

.payload_view {
    height: 35px;
    width: 35px;
    background-color: var(--bg-light);
    border-radius: 4px;
    pointer-events: none;
}

@include main.mobile-device {
}
</style>
