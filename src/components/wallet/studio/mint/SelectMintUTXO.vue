<template>
    <div>
        <div v-for="(utxos, assetId) in nftMintDict" :key="assetId" class="family">
            <div class="family_header">
                <p class="name">{{ nftFamsDict[assetId].name }}</p>
                <p class="symbol">{{ nftFamsDict[assetId].symbol }}</p>
                <p class="id">{{ nftFamsDict[assetId].id }}</p>
            </div>
            <div class="mint_group">
                <div v-for="utxo in utxos" :key="utxo.getUTXOID()" @click="select(utxo)">
                    <p>Group {{ utxo.getOutput().getGroupID() }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { IWalletNftMintDict } from '@/store/types'
import { NftFamilyDict } from '@/store/modules/assets/types'
import { UTXO } from 'avalanche/dist/apis/avm'

@Component
export default class SelectMintUTXO extends Vue {
    get nftFamsDict(): NftFamilyDict {
        return this.$store.state.Assets.nftFamsDict
    }

    get nftMintDict(): IWalletNftMintDict {
        return this.$store.getters.walletNftMintDict
    }

    select(utxo: UTXO) {
        this.$emit('change', utxo)
    }
}
</script>
<style scoped lang="scss">
.family {
    margin-top: 24px;
}

.family_header {
    display: flex;
    font-size: 16px;
    border-bottom: 1px solid var(--bg-light);
    padding: 6px 0;

    .symbol,
    .id {
        color: var(--primary-color-light);
    }

    .symbol {
        padding-left: 14px;
    }

    .id {
        flex-grow: 1;
        font-size: 13px;
        text-align: right;
    }
}

.mint_group {
    display: flex;
    flex-wrap: wrap;
    //justify-content: space-evenly;
    //grid-template-columns: repeat(12, 1fr);
    grid-column-gap: 14px;
    grid-row-gap: 14px;
    padding: 14px 0;

    > div {
        flex-shrink: 0;
        flex-grow: 0;
        flex-basis: 60px;
        border: 1px dashed var(--bg-light);
        background-color: var(--bg-light);
        padding: 30px;
        cursor: pointer;
        text-align: center;
        transition-duration: 0.2s;
        font-size: 13px;

        &:hover {
            border-color: var(--primary-color);
            transform: scale(1.1);
        }
    }
}
</style>
