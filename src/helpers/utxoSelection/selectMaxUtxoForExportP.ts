import { UTXO } from 'avalanche/dist/apis/platformvm'
import { bintools } from '@/AVA'
import { sumUtxos } from '@/helpers/utxoSelection/sumUtxos'
import { MAX_TX_SIZE_P } from './constants'

function parseAddresses(addrs: string[]) {
    return addrs.map((addr) => bintools.stringToAddress(addr))
}

function getCredentialsSizeForSigners(size: number) {
    // Each cred is of size 8 + 65 * sigs
    return 8 + 65 * size
}

function getInputSizeForSigners(size: number) {
    // 16 + 4 * len(address_indices) bytes
    const transferableInputSize = 16 + 4 * size
    // 68 + size(input) bytes
    return 68 + transferableInputSize
}

/**
 * Return the maximum number of UTXOs that can be consumed for this transaction, and their AVAX sum.
 * @param utxos Available UTXOs in preferred order.
 */
export function selectMaxUtxoForExportP(utxos: UTXO[]) {
    // TransferableOutput
    // 32 + size(output) bytes
    // SecpTransferOut
    // 28 + 20 * len(addresses) bytes, assuming 1 output
    const exportOutSize = 32 + 48
    const changeOutSize = 32 + 48

    // BaseTx
    // 52 + size(outputs) + size(inputs) + size(memo) bytes
    const baseTxSize = 52 + 4 + changeOutSize

    // ExportTx
    // 36 + size(outs) + size(base_tx) bytes
    let totalSize = 36 + 4 + exportOutSize + 4 + baseTxSize

    // Add utxos until we reach the max size
    const finalUtxos = []
    for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i]
        const signersNum = utxo.getOutput().getThreshold()

        // 161 is the size of 1 utxo + cred
        const credsSize = getCredentialsSizeForSigners(signersNum)
        const inputSize = getInputSizeForSigners(signersNum)
        const addSize = credsSize + inputSize

        // If greater than max size, stop
        if (totalSize + addSize > MAX_TX_SIZE_P) {
            break
        } else {
            totalSize += addSize
            finalUtxos.push(utxo)
        }
    }

    const finalAvaxAmount = sumUtxos(finalUtxos)

    return {
        amount: finalAvaxAmount,
        utxos: finalUtxos,
    }
}
