import { ITransactionData, UTXO } from '@/store/modules/history/types'
import { WalletType } from '@/js/wallets/types'
import { BN } from 'avalanche'
import { AVMConstants } from 'avalanche/dist/apis/avm'

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

        const addrDiff = addresses.filter((addr) => !dict[assetId].addresses.includes(addr))
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
    const nftLoss = getLossNFT(tx, wallet)
    const nftGain = getGainNFT(tx, wallet)
    return {
        sent: nftLoss,
        received: nftGain,
    }
}

function getLossNFT(tx: ITransactionData, wallet: WalletType): NFTSummaryResultDict {
    const walletAddrs = wallet.getHistoryAddresses()
    const addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    const inputs = tx.inputs || []
    const outputs = tx.outputs

    const loss: NFTSummaryResultDict = {
        assets: {},
        addresses: [],
    }

    const nfts = inputs.filter((input) => {
        const type = input.output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    const nftsOuts = outputs.filter((output) => {
        const type = output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    for (let i = 0; i < nfts.length; i++) {
        const utxo = nfts[i].output
        const owners = utxo.addresses
        const assetID = utxo.assetID

        const intersect = owners.filter((addr) => addrsStripped.includes(addr))

        // Did we lose it?
        if (intersect.length > 0) {
            if (loss.assets[assetID]) {
                loss.assets[assetID].push(utxo)
            } else {
                loss.assets[assetID] = [utxo]
            }

            // Who did we lose it to?
            for (let n = 0; i < nftsOuts.length; n++) {
                const nftOut = nftsOuts[n]
                const doesMatch = nftOut.groupID === utxo.groupID && nftOut.assetID === utxo.assetID
                const addrNotAdded = nftOut.addresses.filter(
                    (addr) => !loss.addresses.includes(addr)
                )
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
    const walletAddrs = wallet.getHistoryAddresses()
    const addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    const inputs = tx.inputs || []
    const outputs = tx.outputs

    const gain: NFTSummaryResultDict = {
        assets: {},
        addresses: [],
    }

    const nftsIns = inputs.filter((input) => {
        const type = input.output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    const nftsOuts = outputs.filter((output) => {
        const type = output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    for (let i = 0; i < nftsOuts.length; i++) {
        const utxo = nftsOuts[i]
        const owners = utxo.addresses
        const assetID = utxo.assetID

        const intersect = owners.filter((addr) => addrsStripped.includes(addr))

        // Did we gain it?
        if (intersect.length > 0) {
            if (gain.assets[assetID]) {
                gain.assets[assetID].push(utxo)
            } else {
                gain.assets[assetID] = [utxo]
            }

            // Who did we gain it from?
            for (let n = 0; n < nftsIns.length; n++) {
                const nftIn = nftsIns[n].output
                const doesMatch = nftIn.groupID === utxo.groupID && nftIn.assetID === utxo.assetID
                const addrNotAdded = nftIn.addresses.filter(
                    (addr) => !gain.addresses.includes(addr)
                )
                if (doesMatch) {
                    gain.addresses.push(...addrNotAdded)
                }
            }
        }
    }

    return gain
}

function getLoss(tx: ITransactionData, wallet: WalletType): TokenSummaryResult {
    const ins = tx.inputs || []
    const outs = tx.outputs

    const walletAddrs = wallet.getHistoryAddresses()
    const addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    const loss: TokenSummaryResult = {}

    if (ins) {
        for (let i = 0; i < ins.length; i++) {
            const input = ins[i]
            const utxo = input.output
            const outputType = utxo.outputType
            const isNft = outputType === AVMConstants.NFTXFEROUTPUTID

            if (isNft) continue

            const addrs = utxo.addresses

            const intersect = addrs.filter((addr) => addrsStripped.includes(addr))

            if (intersect.length === 0) continue

            const assetId = utxo.assetID
            const amount = utxo.amount
            const amountBN = new BN(amount)

            // Get who received this asset
            const receivers: string[] = []
            outs.forEach((utxo) => {
                if (utxo.assetID === assetId) {
                    const outAddrs = utxo.addresses
                    // If not a wallet address and not added to receivers
                    const targets = outAddrs.filter(
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
    const outs = tx.outputs
    const ins = tx.inputs || []

    const walletAddrs = wallet.getHistoryAddresses()
    const addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])

    const profit: TokenSummaryResult = {}

    if (outs) {
        for (let i = 0; i < outs.length; i++) {
            const utxo = outs[i]
            const outputType = utxo.outputType
            const isNft = outputType === AVMConstants.NFTXFEROUTPUTID

            // Skip NFTs
            if (isNft) continue

            const addrs = utxo.addresses

            const intersect = addrs.filter((addr) => addrsStripped.includes(addr))

            if (intersect.length === 0) continue

            const assetId = utxo.assetID
            const amount = utxo.amount
            const amountBN = new BN(amount)

            // Get who sent this to you
            const senders: string[] = []
            ins.forEach((input) => {
                const utxo = input.output
                if (utxo.assetID === assetId) {
                    const outAddrs = utxo.addresses
                    // If not a wallet address and not added to senders
                    const targets = outAddrs.filter(
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
    const losses = getLoss(tx, wallet)
    const profits = getProfit(tx, wallet)

    const nftSummary = getNFTsSummary(tx, wallet)

    const sum: BaseTxSummary = {
        tokens: {},
        collectibles: {
            sent: nftSummary.sent,
            received: nftSummary.received,
        },
    }

    // First the losses
    for (const assetId in losses) {
        const loss = losses[assetId]

        sum.tokens[assetId] = {
            amount: loss.amount.mul(new BN(-1)),
            payload: loss.payload,
            groupNum: loss.groupNum,
            addresses: loss.addresses,
        }
    }

    for (const assetId in profits) {
        const profit = profits[assetId]

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
    const txsIds: string[] = []
    const filtered: ITransactionData[] = []

    for (let i = 0; i < txs.length; i++) {
        const tx = txs[i]
        const txId = tx.id

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
