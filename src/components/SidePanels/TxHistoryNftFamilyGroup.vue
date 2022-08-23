<template>
    <div class="family_group" v-if="payload">
        <p class="count" v-if="quantity > 1">{{ quantity }}</p>
        <div class="nft_card">
            <NftPayloadView :payload="payload" class="payload_view" small="true"></NftPayloadView>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import { Buffer } from '@c4tplatform/camino'
import { PayloadTypes } from '@c4tplatform/camino/dist/utils'
import { UTXO } from '@/store/modules/history/types'

let payloadtypes = PayloadTypes.getInstance()

@Component({
    components: { NftPayloadView },
})
export default class TxHistoryNftFamilyGroup extends Vue {
    // @Prop() payloads!: PayloadBase[]
    @Prop() utxos!: UTXO[]
    @Prop() assetID!: string

    created() {
        if (!this.nftFamsDict[this.assetID]) {
            this.$store.dispatch('Assets/addUnknownNftFamily', this.assetID)
        }
    }

    get nftFamsDict() {
        return this.$store.state.Assets.nftFamsDict
    }

    get quantity() {
        return this.utxos.length
    }

    parsePayload(rawPayload: string): PayloadBase {
        let payload = Buffer.from(rawPayload, 'base64')
        payload = Buffer.concat([new Buffer(4).fill(payload.length), payload])

        // try {
        let typeId = payloadtypes.getTypeID(payload)
        let pl: Buffer = payloadtypes.getContent(payload)
        let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)
        return payloadbase
        // } catch (e) {
        //     console.error('Unable to parse payload.')
        // console.error(e)
        // }
    }

    get payload(): PayloadBase | null {
        let payload = this.utxos[0].payload
        if (!payload) return null

        try {
            let parsed = this.parsePayload(payload)
            return parsed
        } catch (e) {
            console.error('Unable to parse payload.')
        }
        return null
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

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
    height: 35px !important;
    width: 35px !important;
    background-color: var(--bg-light);
    position: relative;
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    pointer-events: none;
}

.payload_view {
}

@include main.mobile-device {
}
</style>
