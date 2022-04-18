<template>
    <div class="family_row" v-if="hasBalance">
        <div class="title_row">
            <p>{{ token.symbol }}</p>
            <p class="name">{{ token.name }}</p>
        </div>

        <div class="items">
            <ERCNftView
                v-for="tokenIndex in walletBalance"
                :key="tokenIndex.tokenId"
                class="item"
                :token="token"
                :index="tokenIndex"
                @click.native="selectToken(tokenIndex)"
            ></ERCNftView>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ERCNftToken from '@/js/ERCNftToken'
import ERCNftView from '@/components/misc/ERCNftView.vue'
import { iERCNftSelectInput } from '@/components/misc/EVMInputDropdown/types'
import { ERCNftBalance } from '@/store/modules/assets/modules/types'

@Component({
    components: { ERCNftView },
})
export default class ERCNftRow extends Vue {
    @Prop() token!: ERCNftToken

    // created() {
    //     this.getItems()
    // }

    get walletBalance(): ERCNftBalance[] {
        return this.$store.state.Assets.ERCNft.walletBalance[this.token.data.address] || []
    }

    get hasBalance(): boolean {
        return this.walletBalance.length > 0
    }

    selectToken(index: ERCNftBalance) {
        let data: iERCNftSelectInput = {
            id: index,
            token: this.token,
        }
        this.$emit('select', data)
    }
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
