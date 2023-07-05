<template>
    <div class="import_row" :export="isExport && !isExportReceiver">
        <p class="actionTitle">{{ actionTitle }} ({{ chainAlias }})</p>
        <div class="flex-column">
            <p v-if="isExportReceiver" class="amt">
                {{ toLocaleString(outputReceivedBalances, 9) }} AVAX
            </p>
            <template v-else>
                <p class="amt" v-for="(bal, key) in balances" :key="key">
                    {{ isExport ? '-' : '' }}{{ toLocaleString(bal.amount, bal.decimals) }}
                    {{ bal.symbol }}
                </p>
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import { avm, cChain, pChain } from '@/AVA'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'
import {
    isTransactionP,
    isTransactionX,
    TransactionType,
    XChainTransaction,
} from '@/js/Glacier/models'
import { getExportBalances } from '@/components/SidePanels/History/ViewTypes/getExportBalances'
import { WalletType } from '@/js/wallets/types'
import { isOwnedUTXO } from '@/js/Glacier/isOwnedUtxo'

function idToAlias(chainId: string | undefined) {
    if (chainId === pChain.getBlockchainID()) {
        return 'P'
    } else if (chainId === avm.getBlockchainID()) {
        return 'X'
    } else if (chainId === cChain.getBlockchainID()) {
        return 'C'
    }
    return chainId
}

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
        if (this.isExport) {
            if (this.isExportReceiver) {
                return 'Received'
            } else {
                return 'Export'
            }
        } else {
            return 'Import'
        }
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
        return idToAlias(chainId)
    }

    /**
     * All X/P addresses used by the wallet
     */
    get addresses() {
        let wallet: WalletType | null = this.$store.state.activeWallet
        if (!wallet) return []
        return wallet.getHistoryAddresses()
    }

    get ownedInputs() {
        const tx = this.transaction
        if (isTransactionP(tx)) {
            return tx.consumedUtxos.filter((utxo) => {
                return isOwnedUTXO(utxo, this.addresses)
            })
        } else {
            return []
        }
    }

    get ownedOutputs() {
        const tx = this.transaction
        if (isTransactionP(tx)) {
            return tx.emittedUtxos.filter((utxo) => {
                return isOwnedUTXO(utxo, this.addresses)
            })
        } else {
            return []
        }
    }

    get sourceChainAlias() {
        return idToAlias(this.sourceChainId)
    }

    get wallet(): WalletType {
        return this.$store.state.activeWallet
    }

    get balances() {
        return getExportBalances(this.transaction, this.destinationChainId, this.getAssetFromID)
    }

    // If user received tokens from the export, but didnt consume any of their utxos
    // Essentially, the P chain sending hack
    get isExportReceiver() {
        return this.isExport && this.ownedInputs.length === 0 && this.ownedOutputs.length > 0
    }

    get outputReceivedBalances() {
        return this.ownedOutputs.reduce((agg, utxo) => {
            return agg.add(new BN(utxo.amount))
        }, new BN(0))
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
