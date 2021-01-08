<template>
    <div class="tx_row">
        <p class="time">{{ date.toLocaleTimeString() }}</p>
        <div class="tx_detail">
            <component :is="tx_comp" :transaction="transaction"></component>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'
import { AssetsDict, NftFamilyDict } from '@/store/modules/assets/types'
import { bnToBig } from '@/helpers/helper'
import { BN, Buffer } from 'avalanche'

import StakingTx from '@/components/SidePanels/History/ViewTypes/StakingTx.vue'
import BaseTx from '@/components/SidePanels/History/ViewTypes/BaseTx.vue'
import ImportExport from '@/components/SidePanels/History/ViewTypes/ImportExport.vue'

@Component({
    components: {
        StakingTx,
        BaseTx,
        ImportExport,
    },
})
export default class TxRow extends Vue {
    @Prop() transaction!: ITransactionData

    get date() {
        return new Date(this.transaction.timestamp)
    }
    get type() {
        return this.transaction.type
    }

    get tx_comp() {
        switch (this.type) {
            case 'export':
            case 'import':
            case 'pvm_export':
            case 'pvm_import':
                return ImportExport
            case 'add_delegator':
            case 'add_validator':
                return StakingTx
            default:
                return BaseTx
        }
    }

    // get outTotals(): any {
    //     let outTots = this.transaction.outputTotals
    //
    //     let res: any = {}
    //     for (var id in outTots) {
    //         let asset = this.assets[id]
    //         let outTot = outTots[id]
    //
    //         if (asset) {
    //             let amtBn = new BN(outTot)
    //             let big = bnToBig(amtBn, asset.denomination)
    //             res[asset.symbol] = big.toLocaleString()
    //         } else {
    //             let nftFam = this.nftFams[id]
    //             res[nftFam.symbol] = outTot
    //         }
    //     }
    //     return res
    // }

    get assets(): AssetsDict {
        return this.$store.state.Assets.assetsDict
    }

    get nftFams(): NftFamilyDict {
        return this.$store.state.Assets.nftFamsDict
    }

    get memo(): string | null {
        const memo = this.transaction.memo
        const memoText = new Buffer(memo, 'base64').toString('utf8')
        // Bug that sets memo to empty string (AAAAAA==) for some
        // tx types
        if (!memoText.length || memo === 'AAAAAA==') return null

        return memoText
    }
}
</script>
<style scoped lang="scss">
.tx_row {
    //display: grid;
    //grid-template-columns: 1fr 1fr;
    padding: 6px 14px;
    font-size: 13px;
    //margin-bottom: 22px;
}

.date {
    color: var(--primary-color);
    font-size: 14px;
    //display: flex;
    //max-width: 320px;
    //justify-content: space-between;
    padding-right: 30px;
    text-align: right;
    //padding-left: 40%;
}

.tx_detail {
    background-color: var(--bg-light);
    margin-bottom: 8px;
}

.time {
    //color: var(--primary-color-light);
    font-size: 13px;
}
.memo {
    width: max-content;
}
</style>
