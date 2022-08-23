<template>
    <div class="collectible_tab">
        <p v-if="isEmpty" class="empty">
            {{ $t('wallet.collectibles.empty') }}
        </p>
        <div v-else>
            <CollectibleFamily
                v-for="fam in nftFamsDict"
                :family="fam"
                :key="fam.id"
                :disabled-ids="disabledIds"
                @select="selectNft"
            ></CollectibleFamily>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Prop, Component } from 'vue-property-decorator'
import { NftFamilyDict } from '@/store/modules/assets/types'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'

import CollectibleFamily from '@/components/misc/BalancePopup/CollectibleFamily.vue'
@Component({
    components: {
        CollectibleFamily,
    },
})
export default class CollectibleTab extends Vue {
    @Prop({ default: [] }) disabledIds!: string[]
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

    selectNft(nft: UTXO) {
        this.$emit('select', nft)
    }
}
</script>
<style scoped lang="scss">
.collectible_tab {
    padding: 12px 18px;
}

.empty {
    text-align: center;
    padding: 4px 12px;
}

$card_w: 40px;

.fam_title {
    border-bottom: 2px solid var(--bg-light);
}

.card_grid {
    display: grid;
    grid-template-columns: repeat(5, $card_w);
    gap: 12px;
    padding: 8px 0;
}

.card {
    width: $card_w;
    height: $card_w;
    background-color: var(--bg-light);
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    transition-duration: 0.2s;
    cursor: pointer;
    border: 1px solid var(--bg-light);

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
