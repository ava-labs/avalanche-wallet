import { UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm/utxos'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm/utxos'
import { UTXOSet as EVMUTXOSet } from 'avalanche/dist/apis/evm/utxos'
import { avm, cChain, pChain } from '@/AVA'
import { BN } from 'avalanche'

export async function getAtomicUTXOsForAllAddresses<
    UtxoSet extends AVMUTXOSet | PlatformUTXOSet | EVMUTXOSet
>(addrs: string[], chainAlias: string): Promise<UtxoSet> {
    let selection = addrs.slice(0, 1024)
    let remaining = addrs.slice(1024)

    let utxoSet
    if (chainAlias === 'X') {
        utxoSet = await avmGetAtomicUTXOs(selection)
    } else if (chainAlias === 'P') {
        utxoSet = await platformGetAtomicUTXOs(selection)
    } else {
        utxoSet = await evmGetAtomicUTXOs(selection)
    }

    if (remaining.length > 0) {
        // @ts-ignore
        let nextSet = await getAtomicUTXOsForAllAddresses<UtxoSet>(remaining, chainAlias)
        // @ts-ignore
        utxoSet = utxoSet.merge(nextSet)
    }

    return utxoSet as UtxoSet
}

// todo: Use end index to get ALL utxos
async function avmGetAtomicUTXOs(addrs: string[]): Promise<AVMUTXOSet> {
    if (addrs.length > 1024) {
        throw 'Number of addresses can not be greater than 1024.'
    }

    let resultP: AVMUTXOSet = (await avm.getUTXOs(addrs, pChain.getBlockchainID())).utxos
    let resultC: AVMUTXOSet = (await avm.getUTXOs(addrs, cChain.getBlockchainID())).utxos
    // TODO: Can you merge like this?
    let result = resultP.merge(resultC)
    return result
}

// todo: Use end index to get ALL utxos
async function platformGetAtomicUTXOs(addrs: string[]): Promise<PlatformUTXOSet> {
    if (addrs.length > 1024) {
        throw 'Number of addresses can not be greater than 1024.'
    }

    let result: PlatformUTXOSet = (await pChain.getUTXOs(addrs, avm.getBlockchainID())).utxos
    return result
}

// todo: Use end index to get ALL utxos
async function evmGetAtomicUTXOs(addrs: string[]): Promise<EVMUTXOSet> {
    if (addrs.length > 1024) {
        throw 'Number of addresses can not be greater than 1024.'
    }

    let result: EVMUTXOSet = (await cChain.getUTXOs(addrs, avm.getBlockchainID())).utxos
    return result
}

export async function getStakeForAddresses(addrs: string[]): Promise<BN> {
    if (addrs.length <= 256) {
        let stakeData = await pChain.getStake(addrs)
        return stakeData.staked
    } else {
        //Break the list in to 1024 chunks
        let chunk = addrs.slice(0, 256)
        let remainingChunk = addrs.slice(256)

        let stakeData = await pChain.getStake(chunk)
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
        response = await avm.getUTXOs(addrs)
    } else {
        response = await avm.getUTXOs(addrs, undefined, 0, endIndex)
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
        response = await pChain.getUTXOs(addrs)
    } else {
        response = await pChain.getUTXOs(addrs, undefined, 0, endIndex)
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
