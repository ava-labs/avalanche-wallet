import { UTXOSet as AVMUTXOSet } from '@c4tplatform/camino/dist/apis/avm/utxos'
import { UTXOSet as PlatformUTXOSet } from '@c4tplatform/camino/dist/apis/platformvm/utxos'
import { ava } from '@/AVA'
import { BN } from '@c4tplatform/camino'

export async function getStakeForAddresses(addrs: string[]): Promise<BN> {
    if (addrs.length <= 256) {
        let stakeData = await ava.PChain().getStake(addrs)
        return stakeData.staked
    } else {
        //Break the list in to 1024 chunks
        let chunk = addrs.slice(0, 256)
        let remainingChunk = addrs.slice(256)

        let stakeData = await ava.PChain().getStake(chunk)
        let chunkStake = stakeData.staked
        return chunkStake.add(await getStakeForAddresses(remainingChunk))
    }
}

export async function avmGetAllUTXOs(addrs: string[]): Promise<AVMUTXOSet> {
    if (addrs.length <= 1024) {
        let utxos = await avmGetAllUTXOsForAddresses(addrs)
        return utxos
    } else {
        //Break the list in to 1024 chunks
        let chunk = addrs.slice(0, 1024)
        let remainingChunk = addrs.slice(1024)

        let newSet = await avmGetAllUTXOsForAddresses(chunk)
        return newSet.merge(await avmGetAllUTXOs(remainingChunk))
    }
}

export async function avmGetAllUTXOsForAddresses(
    addrs: string[],
    endIndex: any = undefined
): Promise<AVMUTXOSet> {
    if (addrs.length > 1024) throw new Error('Maximum length of addresses is 1024')
    let response
    if (!endIndex) {
        response = await ava.XChain().getUTXOs(addrs)
    } else {
        response = await ava.XChain().getUTXOs(addrs, undefined, 0, endIndex)
    }

    let utxoSet = response.utxos
    let utxos = utxoSet.getAllUTXOs()
    let nextEndIndex = response.endIndex
    let len = response.numFetched

    if (len >= 1024) {
        let subUtxos = await avmGetAllUTXOsForAddresses(addrs, nextEndIndex)
        return utxoSet.merge(subUtxos)
    }
    return utxoSet
}

// helper method to get utxos for more than 1024 addresses
export async function platformGetAllUTXOs(addrs: string[]): Promise<PlatformUTXOSet> {
    if (addrs.length <= 1024) {
        let newSet = await platformGetAllUTXOsForAddresses(addrs)
        return newSet
    } else {
        //Break the list in to 1024 chunks
        let chunk = addrs.slice(0, 1024)
        let remainingChunk = addrs.slice(1024)

        let newSet = await platformGetAllUTXOsForAddresses(chunk)

        return newSet.merge(await platformGetAllUTXOs(remainingChunk))
    }
}

export async function platformGetAllUTXOsForAddresses(
    addrs: string[],
    endIndex: any = undefined
): Promise<PlatformUTXOSet> {
    let response
    if (!endIndex) {
        response = await ava.PChain().getUTXOs(addrs)
    } else {
        response = await ava.PChain().getUTXOs(addrs, undefined, 0, endIndex)
    }

    let utxoSet = response.utxos
    let nextEndIndex = response.endIndex
    let len = response.numFetched

    if (len >= 1024) {
        let subUtxos = await platformGetAllUTXOsForAddresses(addrs, nextEndIndex)
        return utxoSet.merge(subUtxos)
    }

    return utxoSet
}
