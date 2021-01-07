import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm/utxos'
import { avm, cChain, pChain } from '@/AVA'
import { UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm/utxos'

// Handles more than 1024 addresses
async function getAtomicUTXOsForAddresses(addrs: string[], chainAlias: string): Promise<any> {
    let selection = addrs.slice(0, 1024)
    let remaining = addrs.slice(1024)

    let utxoSet = await getAtomicUTXOs(selection, chainAlias)

    if (remaining.length > 0) {
        // @ts-ignore
        let nextSet = await getAtomicUTXOsForAddresses(remaining, chainAlias)
        utxoSet = utxoSet.merge(nextSet)
    }

    return utxoSet
}

// todo: Use end index to get ALL utxos
async function getAtomicUTXOs(addrs: string[], chainAlias: string, endIndex: any = undefined) {
    if (addrs.length > 1024) {
        throw 'Number of addresses can not be greater than 1024.'
    }

    if (chainAlias === 'P') {
        let result: PlatformUTXOSet = (await pChain.getUTXOs(addrs, avm.getBlockchainID())).utxos
        return result
    } else {
        let resultP: AVMUTXOSet = (await avm.getUTXOs(addrs, pChain.getBlockchainID())).utxos
        let resultC: AVMUTXOSet = (await avm.getUTXOs(addrs, cChain.getBlockchainID())).utxos
        let result = resultP.merge(resultC)
        return result
    }
}

export { getAtomicUTXOsForAddresses }
