<template>
    <div class="import_row" :export="isExport">
        <p class="actionTitle">{{ actionTitle }} ({{ chainAlias }})</p>
        <div class="flex-column">
            <p class="amt" v-for="(bal, key) in balances" :key="key">
                {{ isExport ? '-' : '' }}{{ toLocaleString(bal.amount, bal.decimals) }}
                {{ toAssetName(bal.id) }}
            </p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'
import { avm, pChain } from '@/AVA'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'

@Component
export default class ImportExport extends Vue {
    @Prop() transaction!: ITransactionData

    toLocaleString(val: BN, decimals: number) {
        return bnToBig(val, decimals).toLocaleString()
    }

    getAssetFromID(id: string) {
        return this.$store.state.Assets.assetsDict[id]
    }

    toAssetName(assetID: string) {
        if (assetID === this.avaxID) return 'AVAX'
        else {
            const len = assetID.length
            const asset = this.getAssetFromID(assetID)
            return (
                asset?.symbol || `${assetID.substring(0, 3)}...${assetID.substring(len - 3, len)}`
            )
        }
    }

    get isExport() {
        return this.transaction.type === 'export' || this.transaction.type === 'pvm_export'
    }

    get fromChainId() {
        if (!this.transaction.inputs) return '?'
        return this.transaction.inputs[0].output.chainID
    }

    get actionTitle() {
        return this.isExport ? 'Export' : 'Import'
    }

    get avaxID() {
        return this.$store.state['Assets/AVA_ASSET_ID']
    }

    get destinationChainId() {
        let outs = this.transaction.outputs || []

        for (var i = 0; i < outs.length; i++) {
            let out = outs[i]
            let chainId = out.chainID
            if (chainId !== this.fromChainId) {
                return chainId
            }
        }
        return this.fromChainId
    }

    get chainAlias() {
        let chainId
        if (this.isExport) {
            chainId = this.fromChainId
        } else {
            chainId = this.destinationChainId
        }

        if (chainId === pChain.getBlockchainID()) {
            return 'P'
        } else if (chainId === avm.getBlockchainID()) {
            return 'X'
        }
        return chainId
    }

    get balances() {
        const balances: {
            [assetID: string]: {
                id: string
                amount: BN
                decimals: number
            }
        } = {}
        let outs = []
        let allOuts = this.transaction.outputs

        for (var i = 0; i < allOuts.length; i++) {
            let out = allOuts[i]
            let chainId = out.chainID

            if (chainId === this.destinationChainId) {
                outs.push(out)
            }
        }

        outs.forEach((out) => {
            const amt = new BN(out.amount)
            const valNow = balances[out.assetID]?.amount || new BN(0)
            const decimals = this.getAssetFromID(out.assetID)?.denomination || 0
            balances[out.assetID] = {
                amount: valNow.add(amt),
                id: out.assetID,
                decimals,
            }
        })

        return balances
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
