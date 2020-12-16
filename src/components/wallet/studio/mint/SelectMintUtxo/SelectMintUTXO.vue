<template>
    <div class="families">
        <FamilyRow
            v-for="(utxos, assetId) in nftMintDict"
            :key="assetId"
            :family="nftFamsDict[assetId]"
            @select="select"
        ></FamilyRow>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { IWalletNftMintDict } from '@/store/types'
import { NftFamilyDict } from '@/store/modules/assets/types'
import { UTXO } from 'avalanche/dist/apis/avm'
import FamilyRow from '@/components/wallet/studio/mint/SelectMintUtxo/FamilyRow.vue'
@Component({
    components: { FamilyRow },
})
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
@use '../../../../../main';

.families {
    display: grid;
    grid-gap: 14px;
    column-gap: 30px;
    grid-template-columns: 1fr 1fr;
    padding-bottom: 30px;
}

@include main.medium-device {
    .families {
        display: initial;
    }
}
</style>
