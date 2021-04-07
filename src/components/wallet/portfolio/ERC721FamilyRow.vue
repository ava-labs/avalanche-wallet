<template>
    <div>
        <div class="fam_header">
            <p class="name">{{ family.name }}</p>
            <p class="symbol">{{ family.symbol }}</p>
            <p class="fam_id">{{ family.contractAddress }}</p>
        </div>
        <div class="list">
            <ERC721View v-for="(item, i) in items" :key="i" class="group" :url="item">
                <p>{{ item }}</p>
            </ERC721View>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ERC721Token from '@/js/ERC721Token'
import { WalletType } from '@/js/wallets/types'
import ERC721View from '@/components/wallet/portfolio/ERC721View.vue'
@Component({
    components: { ERC721View },
})
export default class ERC721FamilyRow extends Vue {
    @Prop() family!: ERC721Token

    items: any[] = []

    get activeWallet(): WalletType {
        return this.$store.state.activeWallet
    }

    mounted() {
        this.getCollectibles()
    }

    async getCollectibles() {
        let res = await this.family.getAllTokenData('0x' + this.activeWallet.ethAddress)
        console.log(res)
        this.items = res
    }
}
</script>
<style scoped lang="scss">
@use "tokens";
</style>
