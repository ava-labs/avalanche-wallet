<template>
    <div class="import_row" :export="isExport">
        <template v-if="isExport">
            <p>Export ({{ chainAlias }})</p>
            <p class="amt">{{ isExport ? '-' : '' }}{{ amtText }} {{ nativeAssetSymbol }}</p>
        </template>
        <template v-else>
            <p>Import ({{ chainAlias }})</p>
            <p class="amt">{{ amtText }} {{ nativeAssetSymbol }}</p>
        </template>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'
import { ava } from '@/AVA'
import { BN } from '@c4tplatform/camino'
import { bnToBig } from '@/helpers/helper'

@Component
export default class ImportExport extends Vue {
    @Prop() transaction!: ITransactionData

    get isExport() {
        return this.transaction.type === 'export' || this.transaction.type === 'pvm_export'
    }

    get fromChainId() {
        if (!this.transaction.inputs) return '?'
        return this.transaction.inputs[0].output.chainID
    }

    get destinationChainId() {
        let outs = this.transaction.outputs

        for (var i = 0; i < outs.length; i++) {
            let out = outs[i]
            let chainId = out.chainID
            if (chainId !== this.fromChainId) {
                return chainId
            }
        }
        return this.fromChainId
    }

    // get chainId() {
    //     if (!this.isExport) {
    //         return this.transaction.outputs[0].chainID
    //     } else {
    //         return this.transaction.outputs[0].chainID
    //     }
    // }

    get chainAlias() {
        let chainId
        if (this.isExport) {
            chainId = this.fromChainId
        } else {
            chainId = this.destinationChainId
        }

        if (chainId === ava.PChain().getBlockchainID()) {
            return 'P'
        } else if (chainId === ava.XChain().getBlockchainID()) {
            return 'X'
        }
        return chainId
    }

    get amt(): BN {
        if (this.isExport) {
            let outs = []
            let allOuts = this.transaction.outputs

            for (var i = 0; i < allOuts.length; i++) {
                let out = allOuts[i]
                let chainId = out.chainID

                if (chainId === this.destinationChainId) {
                    outs.push(out)
                }
            }

            let sumAmt = outs.reduce((acc, val) => {
                let amt = new BN(val.amount)
                return acc.add(amt)
            }, new BN(0))
            return sumAmt
        } else {
            let ins = this.transaction.inputs || []
            let sumAmt = ins.reduce((acc, val) => {
                let amt = new BN(val.output.amount)
                return acc.add(amt)
            }, new BN(0))

            return sumAmt
        }
        return new BN(0)
    }

    get txFee() {
        return new BN(this.transaction.txFee)
    }

    get amtText() {
        let total = this.amt.add(this.txFee)

        if (!this.isExport) {
            total = this.amt.sub(this.txFee)
        }

        let big = bnToBig(total, 9)
        return big.toLocaleString()
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
.import_row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--primary-color-light);

    &[export] {
        .amt {
            color: #d04c4c;
        }
    }
}

.amt {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
    color: var(--success);
}
</style>
