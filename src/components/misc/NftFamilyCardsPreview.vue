<template>
    <div class="previews">
        <div
            v-for="(payload, i) in payloads"
            :key="i"
            class="group_preview"
            :style="{
                zIndex: payloads.length - i,
                transform: `translateX(0%)  rotateZ(${(i - payloads.length / 2) * rotateDeg}deg)`,
            }"
        >
            <NftPayloadView :payload="payload" :small="true"></NftPayloadView>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
import { getPayloadFromUTXO } from '@/helpers/helper'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
@Component({
    components: {
        NftPayloadView,
    },
})
export default class NftFamilyCardsPreview extends Vue {
    @Prop() utxos!: UTXO[]
    @Prop({ default: false }) spread!: boolean
    @Prop() max!: number

    get rotateDeg() {
        if (!this.spread) {
            return 5
        } else {
            let len = this.payloads.length
            let maxLen = this.max
            return 25 * ((maxLen - len) / maxLen) + 5
        }
    }

    get payloads() {
        return this.utxos.map((utxo) => {
            return getPayloadFromUTXO(utxo)
        })
    }
}
</script>
<style scoped lang="scss">
.previews {
    display: flex;
    flex-grow: 1;
    position: relative;
    min-height: 70px;
    z-index: 1;
    //display: grid;
    //grid-template-columns: repeat(5, 1fr);
}
.group_preview {
    width: 70px !important;
    height: 90px !important;
    flex-shrink: 0;
    background-color: var(--bg-light);
    border: 1px solid var(--bg-light);
    border-radius: var(--border-radius-sm);
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    user-select: none;
    transform-origin: bottom center !important;
    transition-duration: 0.2s;
    position: absolute !important;
    left: calc(50% - 35px);
}
</style>
