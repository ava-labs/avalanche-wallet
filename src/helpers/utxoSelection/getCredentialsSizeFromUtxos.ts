import { UTXO, UTXOSet, Tx, AmountOutput } from 'avalanche/dist/apis/platformvm'

/**
 * Returns the number of credentials that will be required by these utxos.
 * Equal to the amount of signatures needed.
 * @param utxos
 */
export function getCredentialSizeFromUtxos(utxos: UTXO[]) {
    return utxos.reduce((tot, utxo) => {
        return tot + utxo.getOutput().getThreshold()
    }, 0)
}
