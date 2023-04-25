<template>
    <div>
        <div class="utxos">
            <div v-if="isSender">
                <label v-if="!sentToSelf">Sent</label>
                <label v-else>Sent to self</label>
                <template v-if="!sentToSelf">
                    <BaseTxUtxo
                        v-for="(utxo, i) in sentUTXOs"
                        :key="i"
                        :utxo="utxo"
                        :ins="inputUTXOs"
                        :outs="outputUTXOs"
                        :is-sent="true"
                    ></BaseTxUtxo>
                </template>
                <template v-else>
                    <BaseTxUtxo
                        v-for="(utxo, i) in outputUTXOs"
                        :key="i"
                        :utxo="utxo"
                        :ins="inputUTXOs"
                        :outs="outputUTXOs"
                        :is-sent="true"
                    ></BaseTxUtxo>
                </template>
                <div class="nft_cols">
                    <!--                    <div class="nft_addr">-->
                    <!--                        <p v-for="addr in summary.collectibles.sent.addresses" :key="addr">-->
                    <!--                            to {{ 'X-' + addr }}-->
                    <!--                        </p>-->
                    <!--                    </div>-->
                    <!--                    <div class="nft_fams">-->
                    <!--                        <BaseTxNFTOutput-->
                    <!--                            v-for="(asset, assetId) in summary.collectibles.sent.assets"-->
                    <!--                            :key="assetId"-->
                    <!--                            :asset-i-d="assetId"-->
                    <!--                            :summary="asset"-->
                    <!--                            class="nft_out"-->
                    <!--                        ></BaseTxNFTOutput>-->
                    <!--                    </div>-->
                </div>
            </div>
            <div v-else>
                <label>Received</label>
                <BaseTxUtxo
                    v-for="(utxo, i) in receivedUTXOs"
                    :key="i"
                    :utxo="utxo"
                    :ins="inputUTXOs"
                    :outs="outputUTXOs"
                    :is-sent="true"
                ></BaseTxUtxo>
                <!--                <BaseTxOutput-->
                <!--                    v-for="(asset, assetId) in tokensReceived"-->
                <!--                    :key="assetId"-->
                <!--                    :asset-i-d="assetId"-->
                <!--                    :summary="asset"-->
                <!--                ></BaseTxOutput>-->
                <!--                <div class="nft_cols">-->
                <!--                    <div class="nft_addr">-->
                <!--                        <p v-for="addr in summary.collectibles.received.addresses" :key="addr">-->
                <!--                            from {{ 'X-' + addr }}-->
                <!--                        </p>-->
                <!--                    </div>-->
                <!--                    <div class="nft_fams">-->
                <!--                        <BaseTxNFTOutput-->
                <!--                            v-for="(asset, assetId) in summary.collectibles.received.assets"-->
                <!--                            :key="assetId"-->
                <!--                            :asset-i-d="assetId"-->
                <!--                            :summary="asset"-->
                <!--                            class="nft_out"-->
                <!--                        ></BaseTxNFTOutput>-->
                <!--                    </div>-->
                <!--                </div>-->
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { TransactionValueDict } from '@/components/SidePanels/types'
import { PayloadBase, PayloadTypes } from 'avalanche/dist/utils'
import { BN, Buffer } from 'avalanche'
import { WalletType } from '@/js/wallets/types'
import { avm, pChain } from '@/AVA'

import TxHistoryValue from '@/components/SidePanels/TxHistoryValue.vue'
import TxHistoryValueFunctional from '@/components/SidePanels/History/TxHistoryValueFunctional.vue'
import TxHistoryNftFamilyGroup from '@/components/SidePanels/TxHistoryNftFamilyGroup.vue'
import { getTransactionSummary } from '@/helpers/history_helper'
import BaseTxOutput from '@/components/SidePanels/History/ViewTypes/BaseTxOutput.vue'
import BaseTxNFTOutput from '@/components/SidePanels/History/ViewTypes/BaseTxNFTOutput.vue'
import { isOwnedUTXO } from '@/js/Glacier/isOwnedUtxo'
import { TransactionTypeName, XChainTransaction } from '@/js/Glacier/models'
import BaseTxUtxo from '@/components/SidePanels/History/ViewTypes/BaseTxUtxo.vue'

let payloadtypes = PayloadTypes.getInstance()

@Component({
    components: {
        BaseTxUtxo,
        BaseTxNFTOutput,
        BaseTxOutput,
        TxHistoryValue,
        TxHistoryValueFunctional,
        TxHistoryNftFamilyGroup,
    },
})
export default class BaseTx extends Vue {
    @Prop() transaction!: XChainTransaction

    // get summary() {
    //     let w = this.$store.state.activeWallet
    //     return getTransactionSummary(this.transaction, w)
    // }

    get inputUTXOs() {
        return this.transaction.consumedUtxos || []
    }

    get outputUTXOs() {
        return this.transaction.emittedUtxos || []
    }

    /**
     * Output UTXOs owned by this wallet
     */
    get receivedUTXOs() {
        return this.outputUTXOs.filter((utxo) => {
            return isOwnedUTXO(utxo, this.addresses)
        })
    }

    /**
     * Output UTXOs not owned by this wallet
     */
    get sentUTXOs() {
        const utxos = this.outputUTXOs.filter((utxo) => {
            return !isOwnedUTXO(utxo, this.addresses)
        })

        return utxos
    }

    get sentToSelf() {
        return this.isSender && !this.sentUTXOs.length
    }

    /**
     * True if this wallet owns one of the input UTXOs
     */
    get isSender() {
        return (
            this.inputUTXOs.filter((utxo) => {
                return isOwnedUTXO(utxo, this.addresses)
            }).length > 0
        )
    }

    get hasReceived() {
        return (
            this.transaction.emittedUtxos.filter((utxo) => {
                return isOwnedUTXO(utxo, this.addresses)
            }).length > 0
        )
    }

    /**
     * All X/P addresses used by the wallet
     */
    get addresses() {
        let wallet: WalletType | null = this.$store.state.activeWallet
        if (!wallet) return []
        return wallet.getHistoryAddresses()
    }

    /**
     * Addresses stripped of the chain prefix
     */
    get addrsRaw() {
        let addrs: string[] = this.addresses
        return addrs.map((addr) => addr.split('-')[1])
    }

    get type() {
        return this.transaction.txType as TransactionTypeName
    }

    // What did I lose?
    // get inValues() {
    //     let addrs: string[] = this.addresses
    //
    //     this.transaction.consumedUtxos.map((utxo) => {
    //         utxo.addresses
    //         utxo.addresses.in
    //     })
    //     let ins = this.transaction.inputs
    //     let res: TransactionValueDict = {} // asset id -> value dict
    //
    //     // if empty
    //     if (!ins) {
    //         return res
    //     }
    //
    //     ins.forEach((inputUtxo) => {
    //         const include = this.includeUtxo(inputUtxo.output, true)
    //         const assetId = inputUtxo.output.assetID
    //         const amt = inputUtxo.output.amount
    //
    //         if (include) {
    //             if (res[assetId]) {
    //                 res[assetId] += parseInt(amt)
    //             } else {
    //                 res[assetId] = parseInt(amt)
    //             }
    //         }
    //     })
    //
    //     return res
    // }

    /**
     *
     * @param utxo The UTXO object
     * @param isInput is it an input UTXO?
     */
    // includeUtxo(utxo: Utxo, isInput?: boolean) {
    //     // Does this wallet own this utxo
    //     const isOwner = utxo.addresses.filter((value) => this.addrsRaw.includes(value)).length > 0
    //
    //     switch (this.transaction.txType) {
    //         case 'export':
    //             return utxo.consumedOnChainId === avm.getBlockchainID()
    //         case 'pvm_export':
    //             return utxo.consumedOnChainId === pChain.getBlockchainID()
    //         case 'pvm_import':
    //         case 'import':
    //             if (isInput) return false
    //             return isOwner
    //         case 'add_validator':
    //         case 'add_delegator':
    //             return !isInput && utxo.stake
    //         case 'operation':
    //             // if no payload it is avax
    //             // check if it is from wallet
    //             if (!utxo.payload && !isOwner) return false
    //             return true
    //         // default just return original logic
    //         // might need to be changed in the future as
    //         // more tx types are added
    //         case 'BaseTx':
    //         default:
    //             return isOwner
    //     }
    //
    //     return false
    // }

    // get tokensReceived() {
    //     let tokens = this.summary.tokens
    //     let res = {}
    //     for (var assetId in tokens) {
    //         let asset = tokens[assetId]
    //         if (asset.amount.gte(new BN(0))) {
    //             //@ts-ignore
    //             res[assetId] = asset
    //         }
    //     }
    //     return res
    // }

    // get tokensSent() {
    //     let tokens = this.summary.tokens
    //     let res = {}
    //     for (var assetId in tokens) {
    //         let asset = tokens[assetId]
    //         if (asset.amount.lt(new BN(0))) {
    //             //@ts-ignore
    //             res[assetId] = asset
    //         }
    //     }
    //     return res
    // }

    // what did I gain?
    // get outValues() {
    //     let addrs: string[] = this.addresses
    //     let addrsRaw = addrs.map((addr) => addr.split('-')[1])
    //     let outs = this.transaction.outputs
    //     let res: TransactionValueDict = {} // asset id -> value dict
    //
    //     // if empty
    //     if (!outs) {
    //         return res
    //     }
    //
    //     outs.forEach((utxoOut) => {
    //         let utxoAddrs = utxoOut.addresses
    //         let assetId = utxoOut.assetID
    //         let amt = utxoOut.amount
    //
    //         const include = this.includeUtxo(utxoOut)
    //
    //         if (include) {
    //             if (res[assetId]) {
    //                 res[assetId] += parseInt(amt)
    //             } else {
    //                 res[assetId] = parseInt(amt)
    //             }
    //         }
    //     })
    //
    //     return res
    // }

    // get valList() {
    //     let ins = this.inValues
    //     let outs = this.outValues
    //     let res = JSON.parse(JSON.stringify(outs))
    //
    //     for (var assetId in ins) {
    //         let inAmount = ins[assetId] || 0
    //         if (res[assetId]) {
    //             res[assetId] -= inAmount
    //         } else {
    //             res[assetId] = -1 * inAmount
    //         }
    //     }
    //
    //     return res
    // }

    // get nftGroups() {
    //     let addrs: string[] = this.addresses
    //     let addrsRaw = addrs.map((addr) => addr.split('-')[1])
    //
    //     let ins = this.transaction.inputs
    //     let outs = this.transaction.outputs
    //     let res: { [key in string]: { [key in string]: PayloadBase[] } } = {}
    //
    //     // res = {
    //     //     'asset id': { ['group id']: 'payload' },
    //     // }
    //
    //     const pushPayload = (rawPayload: string, assetID: string, groupID: number) => {
    //         let payload = Buffer.from(rawPayload, 'base64')
    //         payload = Buffer.concat([new Buffer(4).fill(payload.length), payload])
    //
    //         try {
    //             let typeId = payloadtypes.getTypeID(payload)
    //             let pl: Buffer = payloadtypes.getContent(payload)
    //             let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)
    //
    //             if (res[assetID]) {
    //                 if (res[assetID][groupID]) {
    //                     res[assetID][groupID].push(payloadbase)
    //                 } else {
    //                     res[assetID] = {
    //                         [groupID]: [payloadbase],
    //                     }
    //                 }
    //             } else {
    //                 res[assetID] = {
    //                     [groupID]: [payloadbase],
    //                 }
    //             }
    //         } catch (e) {
    //             // console.error(e)
    //         }
    //     }
    //
    //     if (ins) {
    //         ins.forEach((inputUtxo) => {
    //             const groupID = inputUtxo.output.groupID
    //             const assetID = inputUtxo.output.assetID
    //
    //             if (inputUtxo.output.payload) {
    //                 pushPayload(inputUtxo.output.payload, assetID, groupID)
    //             }
    //         })
    //     }
    //
    //     if (outs) {
    //         outs.forEach((utxoOut) => {
    //             let groupID = utxoOut.groupID
    //             let assetID = utxoOut.assetID
    //
    //             if (utxoOut.payload) {
    //                 pushPayload(utxoOut.payload, assetID, groupID)
    //             }
    //         })
    //     }
    //
    //     return res
    // }

    // get operationDirection() {
    //     if (this.type !== 'operation') return 'N/A'
    //
    //     let addrs: string[] = this.addresses
    //     let addrsRaw = addrs.map((addr) => addr.split('-')[1])
    //
    //     let ins = this.transaction.inputs || []
    //     const isFromWallet = ins.find((input) => {
    //         return input.output.addresses.find((value) => {
    //             return addrsRaw.includes(value)
    //         })
    //     })
    //
    //     return isFromWallet ? 'Sent' : 'Received'
    // }
}
</script>
<style scoped lang="scss">
label {
    font-size: 12px;
    color: var(--primary-color-light);
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

.nft_cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
.nft_addr {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 12px;
    color: var(--primary-color-light);
    overflow: hidden;
    font-family: monospace;
    white-space: nowrap;

    p {
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.nft_fams {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.nft_out {
    margin-bottom: 4px;
}
</style>
