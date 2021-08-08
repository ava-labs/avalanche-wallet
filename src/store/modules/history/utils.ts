import { CsvRowData, ITransactionData, UTXO } from '@/store/modules/history/types'
import { BN } from 'avalanche'
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
export function dataToCsvRow(rowData: CsvRowData): string[] {
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
        rowData.stakeAmount.toString(),
        rowData.stakeDate.format('MM/DD/YYYY'),
        durationToString(rowData.stakeDuration),
        rowData.rewardDate.format('MM/DD/YYYY'),
        rowData.avaxPrice?.toFixed(2) || '-',
        rewardAmtAvax,
        rewardAmtUSD,
    ]
}
