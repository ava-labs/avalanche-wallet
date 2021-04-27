<template>
    <div class="family_row" v-if="hasBalance">
        <div class="title_row">
            <p>{{ token.symbol }}</p>
            <p class="name">{{ token.name }}</p>
        </div>

        <div class="items">
            <ERC721View
                v-for="tokenIndex in walletBalance"
                :key="tokenIndex"
                class="item"
                :token="token"
                :index="tokenIndex"
                @click.native="selectToken(tokenIndex)"
            ></ERC721View>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ERC721Token from '@/js/ERC721Token'
import ERC721View from '@/components/misc/ERC721View.vue'
import { iErc721SelectInput } from '@/components/misc/EVMInputDropdown/types'
import { ERC721WalletBalance } from '@/store/modules/assets/modules/types'

@Component({
    components: { ERC721View },
})
export default class ERC721Row extends Vue {
    @Prop() token!: ERC721Token

    // created() {
    //     this.getItems()
    // }

    get walletBalance(): string[] {
        return this.$store.state.Assets.ERC721.walletBalance[this.token.contractAddress] || []
    }

    get hasBalance(): boolean {
        return this.walletBalance.length > 0
    }

    selectToken(index: string) {
        let data: iErc721SelectInput = {
            id: index,
            token: this.token,
        }
        this.$emit('select', data)
    }

    // async getItems() {
    //     let w: WalletType = this.$store.state.activeWallet
    //     let items = await this.token.getAllTokenData('0x' + w.ethAddress)
    //     this.nftItems = items
    // }
}
</script>
<style scoped lang="scss">
.family_row {
    display: flex !important;
    flex-direction: column;
}
p {
    margin-bottom: 4px;
}

.name {
    color: var(--primary-color-light);
    font-size: 13px;
}

.title_row {
    margin-bottom: 8px;
}
.items {
    display: grid;
    column-gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));

    > * {
        cursor: pointer;
        &:hover {
            opacity: 0.4;
        }
    }
}
</style>
