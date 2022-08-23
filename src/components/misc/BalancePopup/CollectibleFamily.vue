<template>
    <div v-if="utxos.length > 0" class="collectible_family">
        <p class="fam_title">{{ family.name }}</p>
        <div class="group_grid">
            <div
                v-for="(utxo, i) in uniqueGroups"
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
import { NFTTransferOutput, UTXO } from '@c4tplatform/camino/dist/apis/avm'
import { Buffer } from '@c4tplatform/camino'
import { PayloadBase, PayloadTypes } from '@c4tplatform/camino/dist/utils'
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
        // return this.$store.getters.walletNftDict
        return this.$store.getters['Assets/walletNftDict']
    }
    get utxos() {
        let id = this.family.id
        return this.nftDict[id] || []
    }

    get uniqueGroups() {
        let ids: number[] = []
        return this.utxos.filter((utxo) => {
            let gId = (utxo.getOutput() as NFTTransferOutput).getGroupID()
            if (ids.includes(gId)) {
                return false
            } else {
                ids.push(gId)
                return true
            }
        })
    }

    get payloads() {
        return this.uniqueGroups.map((utxo) => {
            return getPayloadFromUTXO(utxo)
        })
    }

    click(utxo: UTXO) {
        this.$emit('select', utxo)
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.collectible_family {
    display: grid;
    grid-template-columns: 1fr max-content;
}
//.fam_title {
//    border-bottom: 2px solid var(--bg-light);
//}
$card_w: 80px;

.group_grid {
    display: grid;
    grid-template-columns: repeat(5, $card_w);
    gap: 12px;
}

.card {
    position: relative;
    width: $card_w;
    height: $card_w;
    background-color: var(--bg-light);
    border-radius: var(--border-radius-sm);
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

@include main.mobile-device {
    $card_w: 60px;

    .collectible_family {
        display: block;
    }
    .fam_title {
        color: var(--primary-color-light);
        font-size: 12px;
        margin-bottom: 8px !important;
    }

    .group_grid {
        grid-template-columns: repeat(5, $card_w);
    }
    .card {
        width: $card_w;
        height: $card_w;
    }
}
</style>
