<template>
    <div class="tx_row">
        <div v-if="source.isMonthChange">
            <p class="date_label">{{ monthLabel }}</p>
        </div>
        <p v-else></p>
        <p v-if="source.isDayChange" class="date_label">{{ dayLabel }}</p>
        <p v-else></p>
        <div class="tx_cols">
            <div>
                <p class="time">{{ date.toLocaleTimeString() }}</p>
                <div v-if="memo" class="memo">
                    <label>MEMO</label>
                    <p>{{ memo }}</p>
                </div>
            </div>
            <div class="tx_detail">
                <component :is="tx_comp" :transaction="source"></component>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData, ITransactionDataProcessed } from '@/store/modules/history/types'
import { AssetsDict, NftFamilyDict } from '@/store/modules/assets/types'
import { bnToBig } from '@/helpers/helper'
import { BN, Buffer } from 'avalanche'

import StakingTx from '@/components/SidePanels/History/ViewTypes/StakingTx.vue'
import BaseTx from '@/components/SidePanels/History/ViewTypes/BaseTx.vue'
import ImportExport from '@/components/SidePanels/History/ViewTypes/ImportExport.vue'
import moment from 'moment'

@Component({
    components: {
        StakingTx,
        BaseTx,
        ImportExport,
    },
})
export default class TxRow extends Vue {
    // @Prop() transaction!: ITransactionData
    // @Prop() txs!: ITransactionData[]
    @Prop() index!: number
    @Prop() source!: ITransactionDataProcessed

    // showMonth = false
    // showDay = false

    mounted() {
        // let index = this.index
        // if (index === 0) {
        //     this.showMonth = true
        //     this.showDay = true
        //     return
        // }
        //
        // let txBefore = this.txs[index - 1]
        //
        // let date = new Date(this.transaction.timestamp)
        // let dateBefore = new Date(txBefore.timestamp)
        //
        // if (dateBefore.getMonth() !== date.getMonth()) {
        //     this.showMonth = true
        //     this.showDay = true
        // } else if (dateBefore.getDay() !== date.getDay()) {
        //     this.showDay = true
        // }
    }

    get date() {
        return new Date(this.source.timestamp)
    }
    get type() {
        return this.source.type
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
        const memo = this.source.memo
        const memoText = new Buffer(memo, 'base64').toString('utf8')
        // Bug that sets memo to empty string (AAAAAA==) for some
        // tx types
        if (!memoText.length || memo === 'AAAAAA==') return null

        return memoText
    }

    get mom() {
        return moment(this.source.timestamp)
    }
    get dayLabel() {
        return this.mom.format('dddd Do')
    }

    get monthLabel(): string {
        let month = this.mom.format('MMMM')
        return month
    }

    get yearLabel(): string {
        return this.mom.format('Y')
    }
}
</script>
<style scoped lang="scss">
.tx_row {
    //display: grid;
    //grid-template-columns: 1fr 1fr;
    padding: 6px 14px;
    font-size: 13px;
    display: grid;
    grid-template-columns: 1fr 1fr 450px;
    //margin-bottom: 22px;
}
.tx_cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: var(--bg-light);
    padding: 8px 14px;
    border-radius: 4px;
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
    margin-bottom: 8px;
    width: 100%;
}

.time {
    //color: var(--primary-color-light);
    font-size: 13px;
}
.memo {
    label {
        font-size: 12px;
        color: var(--primary-color-light);
    }
    p {
        font-size: 12px;
    }
    overflow-wrap: break-word;
    width: 100%;
}

.date_label {
    line-height: 24px;
    position: sticky;
    top: 0px;
    height: max-content;
    font-size: 24px;
    width: max-content;
    z-index: 2;
    //background-color: var(--bg);
}
</style>
