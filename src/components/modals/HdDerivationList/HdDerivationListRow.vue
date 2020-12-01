<template>
    <div class="list_row">
        <p class="col_index" style="text-align: center">{{ index }}</p>
        <p class="col_addr">{{ address }}</p>
        <div class="col_bal">
            <p v-if="noBalance">-</p>
            <template v-else>
                <p v-for="(bal, assetId) in cleanBalance" :key="assetId">
                    {{ bal.toLocaleString(assetsDict[assetId].denomination) }}
                    <span>{{ assetsDict[assetId].symbol }}</span>
                </p>
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Big from 'big.js'
import { DerivationListBalanceDict } from '@/components/modals/HdDerivationList/types'

@Component
export default class HdDerivationListRow extends Vue {
    @Prop() index!: number
    @Prop() address!: string
    @Prop() balance!: DerivationListBalanceDict

    get cleanBalance(): DerivationListBalanceDict {
        let res: DerivationListBalanceDict = {}
        for (var bal in this.balance) {
            let balance: Big = this.balance[bal]
            if (balance.gt(Big(0))) {
                res[bal] = balance
            }
        }
        return res
    }

    get noBalance(): boolean {
        return Object.keys(this.cleanBalance).length === 0
    }

    get assetsDict() {
        return this.$store.state.Assets.assetsDict
    }
}
</script>
<style scoped lang="scss">
.col_index {
    color: var(--primary-color-light);
}

.col_addr {
    /*white-space: nowrap;*/
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    font-family: monospace;
    color: var(--primary-color-light);
}

.col_bal {
    text-align: right;
    padding-right: 15px;
    padding-left: 15px;
    font-family: monospace;
    word-break: keep-all;
    white-space: nowrap;
}

span {
    /*background-color: #ddd;*/
    /*padding: 2px 6px;*/
    border-radius: 2px;
    font-weight: bold;
}
</style>
