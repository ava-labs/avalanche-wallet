<template>
    <div class="tx_history_row">
        <!--        <div class="icons">-->
        <!--            <img v-for="url in icons" :src="url" :key="url">-->
        <!--        </div>-->
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
            <div class="utxos">
                <tx-history-value
                    v-for="(amount, assetId) in valList"
                    :key="assetId"
                    :amount="amount"
                    :type="type"
                    :asset-id="assetId"
                    :is-income="false"
                ></tx-history-value>
                <tx-history-nft
                    v-for="(payload, assetId, i) in nftPayloads"
                    :key="i"
                    :payload="payload"
                ></tx-history-nft>
                <!--                <tx-history-value v-for="(amount, assetId) in outValues" :key="assetId" :amount="amount" :asset-id="assetId" :is-income="true"></tx-history-value>-->
            </div>
            <div v-if="memo" class="memo">Memo: {{ memo }}</div>
            <div v-if="transaction.rewarded" class="rewarded">
                ✅ {{ $t('transactions.rewarded') }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import moment from 'moment'
import TxHistoryValue from '@/components/SidePanels/TxHistoryValue.vue'
import TxHistoryNft from '@/components/SidePanels/TxHistoryNft.vue'
import { getAssetIcon, getPayloadFromUTXO } from '@/helpers/helper'
import BN from 'bn.js'
import { ITransactionData, TransactionType, UTXO } from '@/store/modules/history/types'
import { ActionType, TransactionNftDict, TransactionValueDict } from '@/components/SidePanels/types'
import store from '@/store'
import { AvaNetwork } from '@/js/AvaNetwork'
import { IWalletNftDict, WalletType } from '@/store/types'
import { avm, pChain } from '@/AVA'
import { NFTTransferOutput } from 'avalanche/dist/apis/avm'

@Component({
    components: {
        TxHistoryValue,
        TxHistoryNft,
    },
})
export default class TxHistoryRow extends Vue {
    @Prop() transaction!: ITransactionData

    get explorerUrl(): string | null {
        // TODO: Make this dynamic
        let network: AvaNetwork = this.$store.state.Network.selectedNetwork
        if (network.explorerSiteUrl) {
            return `${network.explorerSiteUrl}/tx/${this.transaction.id}`
        }
        return null
    }

    get memo(): string | null {
        const memo = this.transaction.memo
        const memoText = new Buffer(memo, 'base64').toString('utf8')
        // Bug that sets memo to empty string (AAAAAA==) for some
        // tx types
        if (!memoText.length || memo === 'AAAAAA==') return null

        return memoText
    }

    get time() {
        return moment(this.transaction.timestamp)
    }

    get timeText(): string {
        let now = Date.now()
        let diff = now - new Date(this.transaction.timestamp).getTime()

        let dayMs = 1000 * 60 * 60 * 24

        if (diff > dayMs) {
            return this.time.format('MMM DD, YYYY')
        }
        return this.time.fromNow()
    }

    get type() {
        return this.transaction.type
    }

    get valList() {
        let ins = this.inValues
        let outs = this.outValues
        let res = JSON.parse(JSON.stringify(outs))

        for (var assetId in ins) {
            let inAmount = ins[assetId] || 0
            if (res[assetId]) {
                res[assetId] -= inAmount
            } else {
                res[assetId] = -1 * inAmount
            }
        }

        return res
    }

    get addresses() {
        let wallet: WalletType = this.$store.state.activeWallet
        if (!wallet) return []

        return wallet.getHistoryAddresses()
    }

    includeUtxo(utxo: UTXO, isInput?: boolean) {
        let addrs: string[] = this.addresses
        let addrsRaw = addrs.map((addr) => addr.split('-')[1])

        const isIncludes = utxo.addresses.filter((value) => addrsRaw.includes(value)).length > 0

        switch (this.transaction.type) {
            case 'export':
                return utxo.chainID === avm.getBlockchainID()
            case 'pvm_export':
                return utxo.chainID === pChain.getBlockchainID()
            case 'pvm_import':
            case 'import':
                if (isInput) return false
                return isIncludes
            case 'add_validator':
            case 'add_delegator':
                return isIncludes && !!utxo.redeemingTransactionID
            case 'operation':
                // if no payload it is avax
                // check if it is from wallet
                if (!utxo.payload) return false
                return true
            // default just return original logic
            // might need to be changed in the future as
            // more tx types are added
            case 'base':
            default:
                return isIncludes
        }

        return false
    }

    // What did I lose?
    get inValues() {
        let addrs: string[] = this.addresses
        let addrsRaw = addrs.map((addr) => addr.split('-')[1])

        let ins = this.transaction.inputs
        let res: TransactionValueDict = {} // asset id -> value dict

        // if empty
        if (!ins) {
            return res
        }

        ins.forEach((inputUtxo) => {
            const include = this.includeUtxo(inputUtxo.output, true)
            const assetId = inputUtxo.output.assetID
            const amt = inputUtxo.output.amount

            if (include) {
                if (res[assetId]) {
                    res[assetId] += parseInt(amt)
                } else {
                    res[assetId] = parseInt(amt)
                }
            }
        })

        return res
    }

    // what did I gain?
    get outValues() {
        let addrs: string[] = this.addresses
        let addrsRaw = addrs.map((addr) => addr.split('-')[1])
        let outs = this.transaction.outputs
        let res: TransactionValueDict = {} // asset id -> value dict

        // if empty
        if (!outs) {
            return res
        }

        outs.forEach((utxoOut) => {
            let utxoAddrs = utxoOut.addresses
            let assetId = utxoOut.assetID
            let amt = utxoOut.amount

            const include = this.includeUtxo(utxoOut)

            if (include) {
                if (res[assetId]) {
                    res[assetId] += parseInt(amt)
                } else {
                    res[assetId] = parseInt(amt)
                }
            }
        })

        return res
    }

    get icons() {
        // let ids = [];
        let urls = []
        let outs = this.outValues

        for (var assetId in outs) {
            // ids.push(assetId);
            urls.push(getAssetIcon(assetId))
        }
        return urls.splice(0, 1)
    }

    get nftDict(): IWalletNftDict {
        return this.$store.getters.walletNftDict
    }

    get nftPayloads() {
        let res: TransactionNftDict = {}

        const isNft = (output: UTXO) => {
            return !res[output.assetID] && this.nftDict[output.assetID]
        }

        const payload = (utxo: UTXO) => {
            return getPayloadFromUTXO(this.nftDict[utxo.assetID][0])
        }

        this.transaction.outputs.forEach((utxo) => {
            if (isNft(utxo)) {
                res[utxo.assetID] = payload(utxo)
            }
        })

        this.transaction.inputs.forEach(({ output }) => {
            if (isNft(output)) {
                res[output.assetID] = payload(output)
            }
        })

        return res
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
    /*padding-right: 0;*/
    /*display: grid;*/
    /*grid-template-columns: 40px 1fr;*/

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
    font-size: 12px;
    color: main.$primary-color-light;
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
