<template>
    <div v-if="hasBalance || !family.canSupport">
        <div class="fam_header">
            <p class="name">{{ family.name }}</p>
            <p class="symbol">{{ family.symbol }}</p>
            <p class="fam_id">{{ family.contractAddress }}</p>
        </div>
        <div class="list" v-if="family.canSupport">
            <ERCNftCard
                v-for="tokenIndex in walletBalance"
                :key="tokenIndex.tokenId"
                class="group"
                :index="tokenIndex.tokenId"
                :token="family"
                :quantity="tokenIndex.quantity"
            ></ERCNftCard>
        </div>
        <div v-else>
            <p>This ERCNft Contract does not support the required interfaces.</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ERCNftToken from '@/js/ERCNftToken'
import ERCNftCard from '@/components/wallet/portfolio/ERCNftCard.vue'
import { ERCNftBalance } from '@/store/modules/assets/modules/types'

@Component({
    components: { ERCNftCard },
})
export default class ERCNftFamilyRow extends Vue {
    @Prop() family!: ERCNftToken

    get walletBalance(): ERCNftBalance[] {
        return this.$store.state.Assets.ERCNft.walletBalance[this.family.data.address] || []
    }

    get hasBalance() {
        return this.walletBalance.length > 0
    }
}
</script>
<style scoped lang="scss">
@use "tokens";
</style>
