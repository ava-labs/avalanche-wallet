import {
    TransactionType,
    TransactionTypeName,
    isTransactionX,
    isTransactionP,
    isCChainExportTransaction,
} from '@/js/Glacier/models'
import { UtxoCsvRow } from '@/js/CSV/models'
import { createUtxoCsvData } from '@/js/CSV/createUtxoCsvData'
import { getTxTimestamp } from '@/js/Glacier/getTxTimestamp'

const SUPPORTED_TYPE: TransactionTypeName[] = ['BaseTx', 'ExportTx', 'ImportTx', 'OperationTx']

/**
 * Create CSV file contents of UTXO movements based on given transactions.
 * Does not include staking transactions.
 * @param txs
 * @param ownedAddresses
 */
export async function createUtxoCSV(
    txs: TransactionType[],
    ownedAddresses: string[],
    evmAddress: string
) {
    const filtered = txs.filter((tx) => SUPPORTED_TYPE.includes(tx.txType))

    return filtered
        .map((tx) => {
            const txRows: UtxoCsvRow[] = []

            const unixTime = getTxTimestamp(tx)
            const date = new Date(unixTime)

            const shared = {
                txID: tx.txHash,
                txType: tx.txType,
                timeStamp: date,
                unixTime: unixTime.toString(),
            }

            if (isTransactionX(tx)) {
                tx.consumedUtxos.forEach((utxo) => {
                    txRows.push({
                        ...shared,
                        ...createUtxoCsvData(utxo, ownedAddresses),
                        isInput: true,
                    })
                })

                tx.emittedUtxos.forEach((utxo) => {
                    txRows.push({
                        ...shared,
                        ...createUtxoCsvData(utxo, ownedAddresses),
                        isInput: false,
                    })
                })
            } else if (isTransactionP(tx)) {
                ;(tx.consumedUtxos || []).forEach((utxo) => {
                    txRows.push({
                        ...shared,
                        ...createUtxoCsvData(utxo, ownedAddresses),
                        isInput: true,
                    })
                })
                ;(tx.emittedUtxos || []).forEach((utxo) => {
                    txRows.push({
                        ...shared,
                        ...createUtxoCsvData(utxo, ownedAddresses),
                        isInput: false,
                    })
                })
            } else if (isCChainExportTransaction(tx)) {
                tx.evmInputs.forEach((evmIn) => {
                    txRows.push({
                        ...shared,
                        isInput: true,
                        amount: evmIn.asset.amount,
                        assetID: evmIn.asset.assetId,
                        chain: tx.sourceChain,
                        isOwner: evmAddress === evmIn.fromAddress,
                        owners: [evmIn.fromAddress],
                        locktime: 0,
                        threshold: 1,
                    })
                })

                tx.emittedUtxos.forEach((utxo) => {
                    txRows.push({
                        ...shared,
                        ...createUtxoCsvData(utxo, ownedAddresses),
                        isInput: false,
                    })
                })
            } else {
                tx.consumedUtxos.forEach((utxo) => {
                    txRows.push({
                        ...shared,
                        ...createUtxoCsvData(utxo, ownedAddresses),
                        isInput: true,
                    })
                })

                tx.evmOutputs.forEach((evmOut) => {
                    txRows.push({
                        ...shared,
                        isInput: true,
                        amount: evmOut.asset.amount,
                        assetID: evmOut.asset.assetId,
                        chain: tx.destinationChain,
                        isOwner: evmAddress === evmOut.toAddress,
                        owners: [evmOut.toAddress],
                        locktime: 0,
                        threshold: 1,
                    })
                })
            }

            return txRows
        })
        .flat()
}
