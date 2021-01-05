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
            <div v-if="memo" class="memo">
                <p>Memo:</p>
                <p>{{ memo }}</p>
            </div>
            <div v-if="transaction.rewarded" class="rewarded">
                ✅&nbsp;{{ $t('transactions.rewarded') }}
            </div>
            <div v-else-if="!transaction.rewarded && !!transaction.rewardedTime" class="rewarded">
                ❌&nbsp;{{ $t('transactions.not_rewarded') }}
            </div>
            <div class="utxos">
                <tx-history-value
                    v-for="(amount, assetId) in valList"
                    :key="assetId"
                    :amount="amount"
                    :type="type"
                    :asset-id="assetId"
                    :is-income="false"
                    :operation-color="operationColor"
                    :operation-direction="operationDirection"
                ></tx-history-value>
                <div class="nfts">
                    <div v-for="(groupIDs, assetID) in nftGroups" :key="assetID">
                        <tx-history-nft-family-group
                            v-for="(payloads, id) in groupIDs"
                            :key="id"
                            :payloads="payloads"
                            :assetID="assetID"
                            class="group"
                        ></tx-history-nft-family-group>
                    </div>
                </div>
                <!--                <tx-history-value v-for="(amount, assetId) in outValues" :key="assetId" :amount="amount" :asset-id="assetId" :is-income="true"></tx-history-value>-->
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import moment from 'moment'
import TxHistoryValue from '@/components/SidePanels/TxHistoryValue.vue'
import TxHistoryNftFamilyGroup from '@/components/SidePanels/TxHistoryNftFamilyGroup.vue'
import { getAssetIcon } from '@/helpers/helper'
import BN from 'bn.js'
import { ITransactionData, TransactionType, UTXO } from '@/store/modules/history/types'
import { TransactionValueDict } from '@/components/SidePanels/types'
import store from '@/store'
import { AvaNetwork } from '@/js/AvaNetwork'
import { ITxNftDict, IWalletNftDict, WalletType } from '@/store/types'
import { avm, pChain } from '@/AVA'
import { NFTTransferOutput } from 'avalanche/dist/apis/avm'
import { Buffer } from 'avalanche'
import { PayloadBase, PayloadTypes } from 'avalanche/dist/utils'
import AvaAsset from '../../js/AvaAsset'
let payloadtypes = PayloadTypes.getInstance()

@Component({
    components: {
        TxHistoryValue,
        TxHistoryNftFamilyGroup,
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

    get addrsRaw() {
        let addrs: string[] = this.addresses
        return addrs.map((addr) => addr.split('-')[1])
    }

    includeUtxo(utxo: UTXO, isInput?: boolean) {
        const isIncludes =
            utxo.addresses.filter((value) => this.addrsRaw.includes(value)).length > 0

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
                return !isInput && utxo.stake
            case 'operation':
                // if no payload it is avax
                // check if it is from wallet
                if (!utxo.payload && !isIncludes) return false
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

    get nftGroups() {
        let addrs: string[] = this.addresses
        let addrsRaw = addrs.map((addr) => addr.split('-')[1])

        let ins = this.transaction.inputs || {}
        let outs = this.transaction.outputs || {}
        let res: { [key in string]: { [key in string]: PayloadBase[] } } = {}

        // res = {
        //     'asset id': { ['group id']: 'payload' },
        // }

        const pushPayload = (rawPayload: string, assetID: string, groupID: number) => {
            let payload = Buffer.from(rawPayload, 'base64')
            payload = Buffer.concat([new Buffer(4).fill(payload.length), payload])

            let typeId = payloadtypes.getTypeID(payload)
            let pl: Buffer = payloadtypes.getContent(payload)
            let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

            if (res[assetID]) {
                if (res[assetID][groupID]) {
                    res[assetID][groupID].push(payloadbase)
                } else {
                    res[assetID] = {
                        [groupID]: [payloadbase],
                    }
                }
            } else {
                res[assetID] = {
                    [groupID]: [payloadbase],
                }
            }
        }

        ins.forEach((inputUtxo) => {
            const groupID = inputUtxo.output.groupID
            const assetID = inputUtxo.output.assetID

            if (inputUtxo.output.payload) {
                pushPayload(inputUtxo.output.payload, assetID, groupID)
            }
        })
        outs.forEach((utxoOut) => {
            let groupID = utxoOut.groupID
            let assetID = utxoOut.assetID

            if (utxoOut.payload) {
                pushPayload(utxoOut.payload, assetID, groupID)
            }
        })

        return res
    }

    // specific to operation txs
    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get operationColor() {
        return this.operationDirection === 'Received' ? 'success' : 'sent'
    }

    get operationDirection() {
        if (this.type !== 'operation') return 'N/A'

        let addrs: string[] = this.addresses
        let addrsRaw = addrs.map((addr) => addr.split('-')[1])

        const isFromWallet = this.transaction.inputs.find((input) => {
            return input.output.addresses.find((value) => {
                return addrsRaw.includes(value)
            })
        })

        return isFromWallet ? 'Sent' : 'Received'
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
    display: grid;
    grid-template-columns: max-content 1fr;

    p:last-of-type {
        text-align: right;
    }
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
