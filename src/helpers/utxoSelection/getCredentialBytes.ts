import {
    UnsignedTx as UnsignedTxX,
    TransferableInput as TransferableInputX,
} from 'avalanche/dist/apis/avm'
import {
    UnsignedTx as UnsignedTxP,
    TransferableInput as TransferableInputP,
} from 'avalanche/dist/apis/platformvm'

/**
 * Size of serialized credentials for the given unsigned transaction in bytes.
 * @param tx
 */
export function getCredentialBytes(tx: UnsignedTxX | UnsignedTxP) {
    let credsSize = 0
    tx.getTransaction()
        .getIns()
        .forEach((input: TransferableInputX | TransferableInputP) => {
            const numSigs = input.getInput().getSigIdxs().length
            // Each cred is of size 8 + 65 * sigs
            credsSize += 8 + 65 * numSigs
        })
    return credsSize
}
