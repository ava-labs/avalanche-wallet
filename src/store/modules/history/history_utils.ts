import {
    CsvRowAvaxTransferData,
    CsvRowStakingData,
    ITransactionData,
    UTXO,
} from '@/store/modules/history/types'
import { BN, Buffer } from '@c4tplatform/camino'
import moment from 'moment'

export function isArraysOverlap(arr1: any[], arr2: any[]): boolean {
    let overlaps = arr1.filter((item) => arr2.includes(item))
    return overlaps.length > 0
}

// To get the stake amount, sum the non-reward output utxos.
export function getStakeAmount(tx: ITransactionData): BN {
    let nonRewardUtxos = tx.outputs.filter((utxo) => !utxo.rewardUtxo && utxo.stake)

    let tot = getOutputTotals(nonRewardUtxos)
    return tot
}

export function getOwnedOutputs(outs: UTXO[], myAddrs: string[]) {
    return outs.filter((out) => {
        let outAddrs = out.addresses
        return isArraysOverlap(myAddrs, outAddrs)
    })
}

export function getAddresses(outs: UTXO[]): string[] {
    let allAddrs: string[] = []

    for (let i = 0; i < outs.length; i++) {
        let out = outs[i]
        let addrs = out.addresses
        allAddrs.push(...addrs)
    }

    // Remove duplicated
    return allAddrs.filter((addr, i) => allAddrs.indexOf(addr) === i)
}

/**
 * Returns only the UTXOs of the given asset id.
 * @param outs
 * @param assetID
 */
export function getAssetOutputs(outs: UTXO[], assetID: string) {
    return outs.filter((out) => out.assetID === assetID)
}

export function getNotOwnedOutputs(outs: UTXO[], myAddrs: string[]) {
    return outs.filter((out) => {
        let outAddrs = out.addresses
        return !isArraysOverlap(myAddrs, outAddrs)
    })
}

export function getOutputTotals(outs: UTXO[]) {
    return outs.reduce((acc, out) => {
        return acc.add(new BN(out.amount))
    }, new BN(0))
}

export function getRewardOuts(outs: UTXO[]) {
    return outs.filter((out) => out.rewardUtxo)
}

export function durationToString(dur: moment.Duration): string {
    let months = dur.months()
    let days = dur.days()
    let hours = dur.hours()

    let res = ``

    if (months) {
        let name = months > 1 ? 'months' : 'month'
        res += `${months} ${name} `
    }

    if (days) {
        let name = days > 1 ? 'days' : 'day'
        res += `${days} ${name} `
    }

    if (hours) {
        let name = hours > 1 ? 'hours' : 'hour'
        res += `${hours} ${name}`
    }
    return res
}

const NOT_REWARD_OWNER_MSG = 'Not The Reward Owner'
export function stakingDataToCsvRow(rowData: CsvRowStakingData): string[] {
    let rewardAmtAvax = rowData.isRewardOwner
        ? rowData.rewardAmtAvax.toString()
        : NOT_REWARD_OWNER_MSG

    let rewardAmtUSD = rowData.isRewardOwner
        ? rowData.rewardAmtUsd?.toFixed(2) || '-'
        : NOT_REWARD_OWNER_MSG

    return [
        rowData.txId,
        rowData.txType,
        rowData.nodeID,
        rowData.stakeAmount.toFixed(),
        rowData.stakeDate.format('MM/DD/YYYY'),
        durationToString(rowData.stakeDuration),
        rowData.rewardDate.format('MM/DD/YYYY'),
        rowData.avaxPrice?.toFixed(2) || '-',
        rewardAmtAvax,
        rewardAmtUSD,
    ]
}

export function avaxTransferDataToCsvRow(rowData: CsvRowAvaxTransferData): string[] {
    let memo = rowData.memo ? `"${rowData.memo}"` : '-'

    let froms = rowData.from ? `"${rowData.from?.join('\n')}"` : '-'
    let tos = rowData.to ? `"${rowData.to?.join('\n')}"` : '-'

    let sendReceive = rowData.isGain ? 'Received' : 'Sent'
    return [
        rowData.txId,
        rowData.date.toLocaleDateString(),
        memo,
        froms,
        tos,
        sendReceive,
        rowData.amount.toFixed(),
    ]
}

export function createCSVContent(rows: string[][]) {
    let csvContent = 'data:text/csv;charset=utf-8,'
    rows.forEach(function (arr) {
        let row = arr.join(',')
        csvContent += row + '\r\n'
    })
    return csvContent
}

/**
 * Starts a download of the given the CSV file as a string
 * @param content The CSV file contents
 */
export function downloadCSVFile(content: string, fileName: string) {
    let encodedUri = encodeURI(content)
    let link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${fileName}.csv`)
    document.body.appendChild(link) // Required for FF

    link.click() // This will download the data file named "my_data.csv".
    link.remove()
}

/**
 * Parses the raw memo field to a human readable string.
 * @param memoRaw The base64 encoded memo string
 */
export function parseMemo(memoRaw: string): string {
    const memoText = new Buffer(memoRaw, 'base64').toString('utf8')
    // Bug that sets memo to empty string (AAAAAA==) for some tx types
    if (!memoText.length || memoRaw === 'AAAAAA==') return ''

    return memoText
}
