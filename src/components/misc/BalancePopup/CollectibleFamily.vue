<template>
    <div v-if="utxos.length > 0">
        <p class="fam_title">{{ family.name }}</p>
        <div class="group_grid">
            <div
                v-for="(utxo, i) in utxos"
                :used="disabledIds.includes(utxo.getUTXOID())"
                :key="utxo.getUTXOID()"
                class="card"
                @click="click(utxo)"
            >
                <NftPayloadView
                    :payload="payloads[i]"
                    small="true"
                    class="payload_view"
                ></NftPayloadView>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { AvaNftFamily } from '@/js/AvaNftFamily'
import { IWalletNftDict } from '@/store/types'
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import { Buffer } from 'avalanche'
import { PayloadBase, PayloadTypes } from 'avalanche/dist/utils'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { getPayloadFromUTXO } from '@/helpers/helper'

let payloadtypes = PayloadTypes.getInstance()

@Component({
    components: {
        NftPayloadView,
    },
})
export default class CollectibleFamily extends Vue {
    @Prop() family!: AvaNftFamily
    @Prop({ default: [] }) disabledIds!: string[]

    get nftFamilies() {
        return this.$store.getters['Assets/nftFamilies']
    }

    get nftDict(): IWalletNftDict {
        return this.$store.getters.walletNftDict
    }
    get utxos() {
        let id = this.family.id
        return this.nftDict[id] || []
    }

    get payloads() {
        return this.utxos.map((utxo) => {
            return getPayloadFromUTXO(utxo)
        })
    }

    click(utxo: UTXO) {
        this.$emit('select', utxo)
    }
}
</script>
<style scoped lang="scss">
.fam_title {
    border-bottom: 2px solid var(--bg-light);
}
$card_w: 40px;

.group_grid {
    display: grid;
    grid-template-columns: repeat(5, $card_w);
    gap: 12px;
    padding: 8px 0;
}

.card {
    width: $card_w;
    height: $card_w;
    background-color: var(--bg-light);
    border-radius: 4px;
    overflow: hidden;
    transition-duration: 0.2s;
    cursor: pointer;
    border: 1px solid var(--bg-light);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        border: 1px solid var(--secondary-color);
        transform: scale(1.1);
    }

    &[used] {
        opacity: 0.1;
        pointer-events: none;
        cursor: not-allowed;
    }
}
</style>
