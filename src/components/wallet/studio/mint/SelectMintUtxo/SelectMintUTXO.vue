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
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
import FamilyRow from '@/components/wallet/studio/mint/SelectMintUtxo/FamilyRow.vue'
@Component({
    components: { FamilyRow },
})
export default class SelectMintUTXO extends Vue {
    get nftFamsDict(): NftFamilyDict {
        return this.$store.state.Assets.nftFamsDict
    }

    get nftMintDict(): IWalletNftMintDict {
        // return this.$store.getters.walletNftMintDict
        return this.$store.getters['Assets/nftMintDict']
    }

    select(utxo: UTXO) {
        this.$emit('change', utxo)
    }
}
</script>
<style scoped lang="scss">
@use '../../../../../styles/main';

.families {
    grid-template-columns: repeat(5, 1fr);
    padding: 30px 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;

    > div {
        width: 230px;
    }
}

@include main.medium-device {
    .families {
        grid-template-columns: repeat(3, 1fr);
    }
}

@include main.mobile-device {
    .families {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
