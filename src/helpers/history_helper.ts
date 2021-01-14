// interface IHistoryParsedBaseTx{
//     sent:
//     received:
// }

import { ITransactionData, UTXO } from '@/store/modules/history/types'
import { WalletType } from '@/store/types'
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
    received: {
        [assetID: string]: UTXO[]
    }
    sent: {
        [assetID: string]: UTXO[]
    }
}

interface NFTSummaryResultDict {
    [assetID: string]: UTXO[]
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

// export interface BaseTxNFTSummary {
//     groups: {
//         [groupNum: number]: {
//             amount: BN
//             payload: string
//         }
//     }
// }

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
    let walletAddrs = wallet.getHistoryAddresses()
    let addrsStripped = walletAddrs.map((addr) => addr.split('-')[1])
    let outs = tx.outputs

    let nfts = outs.filter((output) => {
        let type = output.outputType
        if (type === AVMConstants.NFTXFEROUTPUTID) return true
        return false
    })

    let loss: NFTSummaryResultDict = {}
    let gain: NFTSummaryResultDict = {}
    for (var i = 0; i < nfts.length; i++) {
        let nftOut = nfts[i]

        let assetId = nftOut.assetID
        let addrs = nftOut.addresses
        let intersect = addrs.filter((addr) => addrsStripped.includes(addr))

        if (intersect.length === 0) {
            // We lost the NFT
            if (!loss[assetId]) {
                loss[assetId] = [nftOut]
            } else {
                loss[assetId].push(nftOut)
            }
        } else {
            // We received the NFT
            if (!gain[assetId]) {
                gain[assetId] = [nftOut]
            } else {
                gain[assetId].push(nftOut)
            }
        }
    }

    // console.log(loss, gain)

    return {
        sent: loss,
        received: gain,
    }
}

function getLoss(tx: ITransactionData, wallet: WalletType): TokenSummaryResult {
    let ins = tx.inputs
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
                    // let outIntersect = outAddrs.filter((addr) => addrsStripped.includes(addr))
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
    let ins = tx.inputs

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
                    // let outIntersect = outAddrs.filter((addr) => addrsStripped.includes(addr))
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

    // Switch addresses for sent tokens
    const ZERO = new BN(0)
    for (var assetID in sum.tokens) {
        let token = sum.tokens[assetID]
        let amt = token.amount

        // if (amt.lt(ZERO)) {
        //     sum.tokens[assetID].addresses = losses[assetID].addresses
        // }

        // Change addresses if we sent it
        // if(amt.lt(new BN(0))){
        //     tx.outputs.forEach(out => {
        //
        //     })
        // }
    }

    // console.log('Loss/Profit')
    // console.log(sum)
    console.log(sum)
    return sum
}

export { getTransactionSummary }
