import {
    UnsignedTx as UnsignedTxX,
    TransferableInput as TransferableInputX,
} from 'avalanche/dist/apis/avm'
import {
    UnsignedTx as UnsignedTxP,
    TransferableInput as TransferableInputP,
} from 'avalanche/dist/apis/platformvm'
import { getCredentialBytes } from '@/helpers/utxoSelection/getCredentialBytes'
import { bintools } from '@/AVA'

export function getTxSize(tx: UnsignedTxX | UnsignedTxP) {
    // Calculate number of credentials
    const credsSize = getCredentialBytes(tx)

    // What is to total size of the transaction
    return bintools.addChecksum(tx.toBuffer()).length + credsSize // returns in bytes
}
