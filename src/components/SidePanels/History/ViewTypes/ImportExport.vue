<template>
    <div class="import_row" :export="isExport">
        <p class="actionTitle">{{ actionTitle }} ({{ chainAlias }})</p>
        <div class="flex-column">
            <p class="amt" v-for="(bal, key) in balances" :key="key">
                {{ isExport ? '-' : '' }}{{ toLocaleString(bal.amount, bal.decimals) }}
                {{ bal.symbol }}
            </p>
        </div>
    </div>
</template>
<script lang="ts">
import { avm, cChain, pChain } from '@/AVA'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'
import { TransactionType, XChainTransaction } from '@/js/Glacier/models'
import { getExportBalances } from '@/components/SidePanels/History/ViewTypes/getExportBalances'
@Component
export default class ImportExport extends Vue {
    @Prop() transaction!: TransactionType

    toLocaleString(val: BN, decimals: number) {
        return bnToBig(val, decimals).toLocaleString()
    }

    getAssetFromID(id: string) {
        return this.$store.state.Assets.assetsDict[id]
    }

    get isExport() {
        return this.transaction.txType === 'ExportTx'
    }

    get actionTitle() {
        return this.isExport ? 'Export' : 'Import'
    }

    /**
     * Returns the chain id we are exporting/importing to
     */
    get destinationChainId() {
        //TODO: Remove type when PChainTx is ready
        return (this.transaction as XChainTransaction).destinationChain!
    }

    get sourceChainId() {
        //TODO: Remove type when PChainTx is ready
        return (this.transaction as XChainTransaction).sourceChain
    }

    get chainAlias() {
        let chainId = this.isExport ? this.sourceChainId : this.destinationChainId

        if (chainId === pChain.getBlockchainID()) {
            return 'P'
        } else if (chainId === avm.getBlockchainID()) {
            return 'X'
        } else if (chainId === cChain.getBlockchainID()) {
            return 'C'
        }
        return chainId
    }

    get balances() {
        return getExportBalances(this.transaction, this.destinationChainId, this.getAssetFromID)
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

.actionTitle {
    white-space: nowrap;
}

.amt {
    text-align: right;
    font-size: 15px;
    color: var(--success);
    word-break: normal;
}
</style>
