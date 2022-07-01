// interface IHistoryParsedBaseTx{
//     sent:
//     received:
// }

import { ITransactionData, UTXO } from '@/store/modules/history/types'
import { WalletType } from '@/js/wallets/types'
import { BN } from '@c4tplatform/camino'
import { AVMConstants } from '@c4tplatform/camino/dist/apis/avm'

// Summary item returned for each transaction
export interface BaseTxSummary {
    tokens: {
        [assetId: string]: BaseTxAssetSummary
    }
    collectibles: BaseTxNFTSummary
}

interface TokenSummaryResult {
    [assetID: string]: BaseTxAssetSummary
}

export interface BaseTxNFTSummary {
    received: NFTSummaryResultDict
    sent: NFTSummaryResultDict
}

interface NFTSummaryResultDict {
    assets: {
        [assetID: string]: UTXO[]
    }
    addresses: string[]
}

// export interface BaseTxNFTSummary {
//     sent: UTXO[]
//     received: UTXO[]
// }

export interface BaseTxAssetSummary {
    amount: BN
    payload: string | undefined
    groupNum: number
    addresses: string[]
}

// Used with tokens
function addToDict(
    assetId: string,
    amount: BN,
    dict: TokenSummaryResult,
    utxo: UTXO,
    addresses: string[]
) {
    if (dict[assetId]) {
        dict[assetId].amount = dict[assetId].amount.add(amount)

        let addrDiff = addresses.filter((addr) => !dict[assetId].addresses.includes(addr))
        dict[assetId].addresses.push(...addrDiff)
    } else {
        dict[assetId] = {
            amount: amount,
            payload: utxo.payload,
            groupNum: utxo.groupID,
            addresses: addresses,
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

            addToDict(assetId, amountBN, loss, utxo, receivers)
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
            let outputType = utxo.outputType
            let isNft = outputType === AVMConstants.NFTXFEROUTPUTID

            // Skip NFTs
            if (isNft) continue

            let addrs = utxo.addresses

            let intersect = addrs.filter((addr) => addrsStripped.includes(addr))

            if (intersect.length === 0) continue

            let assetId = utxo.assetID
            let amount = utxo.amount
            let amountBN = new BN(amount)

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

            addToDict(assetId, amountBN, profit, utxo, senders)
        }
    }

    return profit
}

// Finds the absolute gains and losses for the active wallet given transaction data from the explorer
function getTransactionSummary(tx: ITransactionData, wallet: WalletType) {
    let losses = getLoss(tx, wallet)
    let profits = getProfit(tx, wallet)

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
            payload: loss.payload,
            groupNum: loss.groupNum,
            addresses: loss.addresses,
        }
    }

    for (let assetId in profits) {
        let profit = profits[assetId]

        if (sum.tokens[assetId]) {
            sum.tokens[assetId].amount = sum.tokens[assetId].amount.add(profit.amount)
        } else {
            sum.tokens[assetId] = {
                amount: profit.amount,
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

export { getTransactionSummary }
