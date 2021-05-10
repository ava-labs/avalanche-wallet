<template>
    <div v-if="hasBalance || !family.canSupport">
        <div class="fam_header">
            <p class="name">{{ family.name }}</p>
            <p class="symbol">{{ family.symbol }}</p>
            <p class="fam_id">{{ family.contractAddress }}</p>
        </div>
        <div class="list" v-if="family.canSupport">
            <ERC721View
                v-for="tokenIndex in walletBalance"
                :key="tokenIndex"
                class="group"
                :index="tokenIndex"
                :token="family"
            ></ERC721View>
        </div>
        <div v-else>
            <p>This ERC721 Contract does not support the required interfaces.</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ERC721Token from '@/js/ERC721Token'
import { WalletType } from '@/js/wallets/types'
import ERC721View from '@/components/wallet/portfolio/ERC721Card.vue'
import { ERC721WalletBalance } from '@/store/modules/assets/modules/types'
@Component({
    components: { ERC721View },
})
export default class ERC721FamilyRow extends Vue {
    @Prop() family!: ERC721Token

    get walletBalance(): string[] {
        return this.$store.state.Assets.ERC721.walletBalance[this.family.contractAddress] || []
    }

    get hasBalance() {
        return this.walletBalance.length > 0
    }
}
</script>
<style scoped lang="scss">
@use "tokens";
</style>
