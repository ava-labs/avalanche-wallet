import { ava, bintools } from '@/AVA'
import { ZeroBN } from '@/constants'
import { IsOutputDeposited, ITransactionData, RawTx, UTXO } from '@/store/modules/history/types'
import { WalletType } from '@/js/wallets/types'

import { BN, Buffer } from '@c4tplatform/caminojs/dist'
import { AVMConstants } from '@c4tplatform/caminojs/dist/apis/avm'
import {
    StandardAmountOutput,
    StandardTransferableInput,
    StandardTransferableOutput,
} from '@c4tplatform/caminojs/dist/common'

// Summary item returned for each transaction
export interface BaseTxSummary {
    tokens: {
        [assetId: string]: BaseTxAssetSummary
    }
    collectibles: BaseTxNFTSummary
}

export interface BaseTxNFTSummary {
    received: NFTSummaryResultDict
    sent: NFTSummaryResultDict
}

export interface BaseTxAssetSummary {
    amount: BN
    deposited: BN
    payload: string | undefined
    groupNum: number
    addresses: string[]
}

interface TokenSummaryResult {
    [assetID: string]: BaseTxAssetSummary
}

interface NFTSummaryResultDict {
    assets: {
        [assetID: string]: UTXO[]
    }
    addresses: string[]
}

interface RawAvaxTx extends RawTx {
    getIns(): StandardTransferableInput[]
    getOuts(): StandardTransferableOutput[]
}

// Used with tokens
function addToDict(
    assetId: string,
    amount: BN,
    deposited: BN,
    dict: TokenSummaryResult,
    utxoPayload: string | undefined,
    utxoGroupID: number,
    addresses: string[]
) {
    if (dict[assetId]) {
        dict[assetId].amount = dict[assetId].amount.add(amount)

        let addrDiff = addresses.filter((addr) => !dict[assetId].addresses.includes(addr))
        dict[assetId].addresses.push(...addrDiff)
    } else {
        dict[assetId] = {
            amount,
            deposited,
            payload: utxoPayload,
            groupNum: utxoGroupID,
            addresses,
        }
    }
}

function getNFTsSummary(tx: ITransactionData, wallet: WalletType): BaseTxNFTSummary {
    let nftLoss = getLossNFT(tx, wallet)
    let nftGain = getGainNFT(tx, wallet)
    return {
        sent: nftLoss,
        received: nftGain,
    }
}

function getLossNFT(tx: ITransactionData, wallet: WalletType): NFTSummaryResultDict {
    let walletAddrs = wallet.getHistoryAddresses()
    let addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    let inputs = tx.inputs || []
    let outputs = tx.outputs

    let loss: NFTSummaryResultDict = {
        assets: {},
        addresses: [],
    }

    let nfts = inputs.filter((input) => {
        let type = input.output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    let nftsOuts = outputs.filter((output) => {
        let type = output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    for (var i = 0; i < nfts.length; i++) {
        let utxo = nfts[i].output
        let owners = utxo.addresses
        let assetID = utxo.assetID

        let intersect = owners.filter((addr) => addrsStripped.includes(addr))

        // Did we lose it?
        if (intersect.length > 0) {
            if (loss.assets[assetID]) {
                loss.assets[assetID].push(utxo)
            } else {
                loss.assets[assetID] = [utxo]
            }

            // Who did we lose it to?
            for (var n = 0; i < nftsOuts.length; n++) {
                let nftOut = nftsOuts[n]
                let doesMatch = nftOut.groupID === utxo.groupID && nftOut.assetID === utxo.assetID
                let addrNotAdded = nftOut.addresses.filter((addr) => !loss.addresses.includes(addr))
                if (doesMatch) {
                    loss.addresses.push(...addrNotAdded)
                    break
                }
            }
        }
    }

    return loss
}

function getGainNFT(tx: ITransactionData, wallet: WalletType): NFTSummaryResultDict {
    let walletAddrs = wallet.getHistoryAddresses()
    let addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    let inputs = tx.inputs || []
    let outputs = tx.outputs

    let gain: NFTSummaryResultDict = {
        assets: {},
        addresses: [],
    }

    let nftsIns = inputs.filter((input) => {
        let type = input.output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    let nftsOuts = outputs.filter((output) => {
        let type = output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    for (var i = 0; i < nftsOuts.length; i++) {
        let utxo = nftsOuts[i]
        let owners = utxo.addresses
        let assetID = utxo.assetID

        let intersect = owners.filter((addr) => addrsStripped.includes(addr))

        // Did we gain it?
        if (intersect.length > 0) {
            if (gain.assets[assetID]) {
                gain.assets[assetID].push(utxo)
            } else {
                gain.assets[assetID] = [utxo]
            }

            // Who did we gain it from?
            for (var n = 0; n < nftsIns.length; n++) {
                let nftIn = nftsIns[n].output
                let doesMatch = nftIn.groupID === utxo.groupID && nftIn.assetID === utxo.assetID
                let addrNotAdded = nftIn.addresses.filter((addr) => !gain.addresses.includes(addr))
                if (doesMatch) {
                    gain.addresses.push(...addrNotAdded)
                }
            }
        }
    }

    return gain
}

function getLoss(tx: ITransactionData, wallet: WalletType): TokenSummaryResult {
    let ins = tx.inputs || []
    let outs = tx.outputs

    let walletAddrs = wallet.getHistoryAddresses()
    let addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    let loss: TokenSummaryResult = {}

    if (ins) {
        for (let i = 0; i < ins.length; i++) {
            let input = ins[i]
            let utxo = input.output
            let outputType = utxo.outputType
            let isNft = outputType === AVMConstants.NFTXFEROUTPUTID

            if (isNft) continue

            let addrs = utxo.addresses

            let intersect = addrs.filter((addr) => addrsStripped.includes(addr))

            if (intersect.length === 0) continue

            let assetId = utxo.assetID
            let amount = utxo.amount
            let amountBN = new BN(amount)
            const depositBN = IsOutputDeposited(utxo.outputType) ? amountBN : ZeroBN

            // Get who received this asset
            let receivers: string[] = []
            outs.forEach((utxo) => {
                if (utxo.assetID === assetId) {
                    let outAddrs = utxo.addresses
                    // If not a wallet address and not added to receivers
                    let targets = outAddrs.filter(
                        (addr: string) => !addrsStripped.includes(addr) && !receivers.includes(addr)
                    )
                    receivers.push(...targets)
                }
            })

            addToDict(assetId, amountBN, depositBN, loss, utxo.payload, utxo.groupID, receivers)
        }
    }

    return loss
}

function getRawLoss(tx: ITransactionData, wallet: WalletType): TokenSummaryResult {
    if (!tx.rawTx) return getLoss(tx, wallet)

    let ins = ((tx.rawTx as unknown) as RawAvaxTx).getIns()
    let outs = ((tx.rawTx as unknown) as RawAvaxTx).getOuts()

    let walletAddrs = wallet.getHistoryAddresses()
    let addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    let loss: TokenSummaryResult = {}

    if (ins) {
        const utxoIds = ins.map((i) => i.getUTXOID())
        const utxos = wallet.getPlatformUTXOSet().getAllUTXOs(utxoIds)

        for (const input of ins) {
            const utxo = wallet.getPlatformUTXOSet().getUTXO(input.getUTXOID())
            const utxoIndex = input.getOutputIdx().readUInt32BE(0)

            let outputType = input.getTypeID()
            if (outputType === AVMConstants.NFTXFEROUTPUTID) continue

            let addrs = strippedAddresses(utxo.getOutput().getAddresses())
            let intersect = addrs.filter((addr) => addrsStripped.includes(addr))
            if (intersect.length === 0) continue

            const assetId = utxo.getAssetID()
            let amountBN = (utxo.getOutput() as StandardAmountOutput).getAmount()
            const depositBN = IsOutputDeposited(outputType) ? amountBN : ZeroBN

            // Get who received this asset
            let receivers: string[] = []
            outs.forEach((out) => {
                if (out.getAssetID().compare(assetId) === 0) {
                    let outAddrs = strippedAddresses(out.getAddresses())
                    // If not a wallet address and not added to receivers
                    let targets = outAddrs.filter(
                        (addr: string) => !addrsStripped.includes(addr) && !receivers.includes(addr)
                    )
                    receivers.push(...targets)
                }
            })

            addToDict(
                bintools.cb58Encode(assetId),
                amountBN,
                depositBN,
                loss,
                undefined,
                utxoIndex,
                receivers
            )
        }
    }

    return loss
}

function getProfit(tx: ITransactionData, wallet: WalletType): TokenSummaryResult {
    let outs = tx.outputs
    let ins = tx.inputs || []

    let walletAddrs = wallet.getHistoryAddresses()
    let addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    let profit: TokenSummaryResult = {}

    if (outs) {
        for (let i = 0; i < outs.length; i++) {
            let utxo = outs[i]

            // Skip NFTs
            if (utxo.outputType === AVMConstants.NFTXFEROUTPUTID) continue

            let addrs = utxo.addresses

            let intersect = addrs.filter((addr) => addrsStripped.includes(addr))

            if (intersect.length === 0) continue

            let assetId = utxo.assetID
            let amount = utxo.amount
            let amountBN = new BN(amount)
            const depositBN = IsOutputDeposited(utxo.outputType) ? amountBN : ZeroBN

            // Get who sent this to you
            let senders: string[] = []
            ins.forEach((input) => {
                let utxo = input.output
                if (utxo.assetID === assetId) {
                    let outAddrs = utxo.addresses
                    // If not a wallet address and not added to senders
                    let targets = outAddrs.filter(
                        (addr: string) => !addrsStripped.includes(addr) && !senders.includes(addr)
                    )
                    senders.push(...targets)
                }
            })

            addToDict(assetId, amountBN, depositBN, profit, utxo.payload, utxo.groupID, senders)
        }
    }

    return profit
}

function getRawProfit(tx: ITransactionData, wallet: WalletType): TokenSummaryResult {
    if (!tx.rawTx) return getProfit(tx, wallet)

    let ins = ((tx.rawTx as unknown) as RawAvaxTx).getIns()
    let outs = ((tx.rawTx as unknown) as RawAvaxTx).getOuts()

    let walletAddrs = wallet.getHistoryAddresses()
    let addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    let profit: TokenSummaryResult = {}

    if (outs) {
        for (const out of outs) {
            // Skip NFTs
            if (out.getTypeID() === AVMConstants.NFTXFEROUTPUTID) continue
            const outIndex = out.getOutput().getOutputID()

            const addrs = strippedAddresses(out.getAddresses())
            const intersect = addrs.filter((addr) => addrsStripped.includes(addr))
            if (intersect.length === 0) continue

            let assetId = out.getAssetID()
            let amountBN = (out.getOutput() as StandardAmountOutput).getAmount()
            const depositBN = IsOutputDeposited(out.getTypeID()) ? amountBN : ZeroBN

            // Get who sent this to you
            let senders: string[] = []
            for (const input of ins) {
                const utxo = wallet.getPlatformUTXOSet().getUTXO(input.getUTXOID())
                if (utxo.getAssetID().compare(assetId) === 0) {
                    let outAddrs = strippedAddresses(utxo.getOutput().getAddresses())
                    // If not a wallet address and not added to senders
                    let targets = outAddrs.filter(
                        (addr: string) => !addrsStripped.includes(addr) && !senders.includes(addr)
                    )
                    senders.push(...targets)
                }
            }

            addToDict(
                bintools.cb58Encode(assetId),
                amountBN,
                depositBN,
                profit,
                undefined,
                outIndex,
                senders
            )
        }
    }

    return profit
}

// Finds the absolute gains and losses for the active wallet given transaction data from the explorer
function getTransactionSummary(tx: ITransactionData, wallet: WalletType) {
    let losses = getRawLoss(tx, wallet)
    let profits = getRawProfit(tx, wallet)

    let nftSummary = getNFTsSummary(tx, wallet)

    // let nftLoss = getLossNFT(tx, wallet)
    // let nftGain = getGainNFT()NFT(tx, wallet)
    // console.log(nftLoss)

    let sum: BaseTxSummary = {
        tokens: {},
        collectibles: {
            sent: nftSummary.sent,
            received: nftSummary.received,
        },
    }

    // First the losses
    for (let assetId in losses) {
        let loss = losses[assetId]

        sum.tokens[assetId] = {
            amount: loss.amount.mul(new BN(-1)),
            deposited: loss.deposited,
            payload: loss.payload,
            groupNum: loss.groupNum,
            addresses: loss.addresses,
        }
    }

    for (let assetId in profits) {
        let profit = profits[assetId]
        let sumAsset = sum.tokens[assetId]

        if (sumAsset) {
            sumAsset.amount = sumAsset.amount.add(profit.amount)
            sumAsset.deposited = sumAsset.deposited.add(profit.deposited)
        } else {
            sum.tokens[assetId] = {
                amount: profit.amount,
                deposited: profit.deposited,
                payload: profit.payload,
                groupNum: profit.groupNum,
                addresses: profit.addresses,
            }
        }
    }

    return sum
}

/**
 * Given an array of transactions from the explorer, filter out duplicate transactions
 * @param txs
 */
export function filterDuplicateTransactions(txs: ITransactionData[]) {
    let txsIds: string[] = []
    let filtered: ITransactionData[] = []

    for (var i = 0; i < txs.length; i++) {
        let tx = txs[i]
        let txId = tx.id

        if (txsIds.includes(txId)) {
            continue
        } else {
            txsIds.push(txId)
            filtered.push(tx)
        }
    }
    return filtered
}

function strippedAddresses(addrs: Buffer[]): string[] {
    return addrs.map((addr) => bintools.addressToString(ava.getHRP(), 'P', addr).slice(2))
}

export { getTransactionSummary }
