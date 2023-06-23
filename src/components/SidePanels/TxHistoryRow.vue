<template>
    <div class="tx_history_row">
        <div>
            <p class="time">
                {{ timeText }}
                <a
                    v-if="explorerUrl"
                    :href="explorerUrl"
                    target="_blank"
                    tooltip="View in Explorer"
                    class="explorer_link"
                >
                    <fa icon="search"></fa>
                </a>
            </p>

            <div v-if="memo" class="memo">
                <p>Memo</p>
                <p>{{ memo }}</p>
            </div>
        </div>
        <component :is="viewComponent" :transaction="transaction"></component>
        <p v-if="hasMultisig" class="multisig_warn">
            <fa icon="exclamation-triangle"></fa>
            Contains Shared Balance (Multisig)
        </p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import moment from 'moment'
import TxHistoryNftFamilyGroup from '@/components/SidePanels/TxHistoryNftFamilyGroup.vue'
import {
    isTransactionX,
    isTransactionC,
    TransactionTypeName,
    XChainTransaction,
} from '@/js/Glacier/models'
import ImportExport from '@/components/SidePanels/History/ViewTypes/ImportExport.vue'
import BaseTx from '@/components/SidePanels/History/ViewTypes/BaseTx.vue'
import StakingTx from '@/components/SidePanels/History/ViewTypes/StakingTx.vue'
import { Utxo, PChainTransaction, PChainUtxo } from '@avalabs/glacier-sdk'
import { getUrlFromTransaction } from '@/js/Glacier/getUrlFromTransaction'
import { ava } from '@/AVA'
import { isOwnedUTXO } from '@/js/Glacier/isOwnedUtxo'
import { WalletType } from '@/js/wallets/types'

@Component({
    components: {
        TxHistoryNftFamilyGroup,
    },
})
export default class TxHistoryRow extends Vue {
    @Prop() transaction!: XChainTransaction | PChainTransaction

    get explorerUrl(): string | null {
        const netID = ava.getNetworkID()
        return getUrlFromTransaction(netID, this.transaction)
    }

    /**
     * True if this tx contains a multi owner output
     */
    get hasMultisig() {
        if (!this.ownedOutputs) return false
        let totMultiSig = 0
        this.ownedOutputs.forEach((utxo: Utxo | PChainUtxo) => {
            if (utxo.addresses.length > 1) {
                totMultiSig++
            }
        })
        return totMultiSig > 0
    }

    get outputUTXOs(): Utxo[] | PChainUtxo[] {
        return this.transaction.emittedUtxos || []
    }

    get addresses() {
        let wallet: WalletType | null = this.$store.state.activeWallet
        if (!wallet) return []
        return wallet.getHistoryAddresses()
    }

    /**
     * Outputs owned by this wallet
     */
    get ownedOutputs() {
        return (this.outputUTXOs as (Utxo | PChainUtxo)[]).filter((utxo: Utxo | PChainUtxo) => {
            return isOwnedUTXO(utxo, this.addresses)
        })
    }

    get memo(): string | null {
        // TODO: Is Memo supported
        return ''
    }

    get timestamp() {
        if (isTransactionX(this.transaction) || isTransactionC(this.transaction)) {
            return this.transaction.timestamp * 1000
        } else {
            return this.transaction.blockTimestamp * 1000
        }
    }

    get time() {
        return moment(this.timestamp)
    }

    get timeText(): string {
        let now = Date.now()
        let diff = now - new Date(this.timestamp).getTime()

        let dayMs = 1000 * 60 * 60 * 24

        if (diff > dayMs) {
            return this.time.format('MMM DD, YYYY')
        }
        return this.time.fromNow()
    }

    get viewComponent() {
        let type = this.transaction.txType as TransactionTypeName

        switch (type) {
            case 'ExportTx':
            case 'ImportTx':
                return ImportExport
            case 'AddDelegatorTx':
            case 'AddValidatorTx':
                return StakingTx
            default:
                return BaseTx
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.icons {
    justify-self: center;
    img {
        width: 20px;
        height: 20px;
        object-fit: contain;
    }
}

.tx_history_row {
    padding: 10px 0px;

    > div {
        align-self: center;
        overflow: auto;
    }
}

.explorer_link {
    color: var(--primary-color-light);
}

.time {
    font-size: 15px;

    a {
        float: right;
        opacity: 0.4;
        font-size: 12px;

        &:hover {
            opacity: 0.8;
        }
    }
}

.from {
    font-size: 12px;
    color: var(--primary-color-light);
    word-break: keep-all;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.rewarded,
.memo {
    overflow-wrap: break-word;
    word-break: break-word;
    font-size: 12px;
    color: main.$primary-color-light;
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 12px;
    margin-bottom: 4px;

    p:last-of-type {
        text-align: right;
    }
}

.rewarded {
    span {
        margin-right: 6px;
        color: var(--success);
    }
}
.not_rewarded span {
    color: var(--error);
}
.nfts {
    display: flex;
    flex-wrap: wrap;
    margin-top: 5px;
    justify-content: flex-end;
    > div {
        margin-left: 5px;
    }
}

.multisig_warn {
    color: var(--error);
    font-size: 0.8em;
}

@include main.medium-device {
    .icons {
        justify-self: left;
        img {
            width: 14px;
            height: 14px;
            object-fit: contain;
        }
    }

    .tx_history_row {
        padding: 8px 0px;
        grid-template-columns: 24px 1fr;
    }
    .time {
        font-size: 14px;
        text-align: left;
    }
}
</style>
