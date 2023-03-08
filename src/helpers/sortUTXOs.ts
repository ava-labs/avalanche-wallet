import { UTXO as AVMUTXO } from 'avalanche/dist/apis/avm'
import {
    AmountOutput,
    UTXO as PlatformUTXO,
    UTXOSet as PlatformUTXOSet,
} from 'avalanche/dist/apis/platformvm'
import { UTXO as EVMUTXO } from 'avalanche/dist/apis/evm'

/**
 * @return Sorted array of UTXOs
 * @param utxos UTXOs to sort
 * @param isAscending If true, sorts lower value UTXO first.
 */
export function sortUTXOsByAmount<UTXOType extends AVMUTXO | PlatformUTXO | EVMUTXO>(
    utxos: UTXOType[],
    isAscending: boolean
) {
    return utxos.sort((a, b) => {
        const amtA = (a.getOutput() as AmountOutput).getAmount()
        const amtB = (b.getOutput() as AmountOutput).getAmount()
        if (amtA.eq(amtB)) return 0
        if (isAscending) {
            return amtA.gt(amtB) ? 1 : -1
        } else {
            return amtA.gt(amtB) ? -1 : 1
        }
    })
}

/**
 * Returns a new UTXO Set with UTXO content sorted accordingly
 * @return New, sorted UTXO Set
 * @param set UTXO Set to sort.
 * @param isAscending If true sorts lower value first
 */
export function sortUTxoSetP(set: PlatformUTXOSet, isAscending: boolean) {
    const utxos = set.getAllUTXOs()
    const sorted = sortUTXOsByAmount(utxos, isAscending)

    const sortedSet = new PlatformUTXOSet()
    sortedSet.addArray(sorted)
    return sortedSet
}
