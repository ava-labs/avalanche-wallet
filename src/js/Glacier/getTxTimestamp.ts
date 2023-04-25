import { isTransactionC, isTransactionX, TransactionType } from '@/js/Glacier/models'

/**
 * Return Javascript UNIX timestamp of the given transaction
 * @param tx
 */
export function getTxTimestamp(tx: TransactionType) {
    if (isTransactionX(tx) || isTransactionC(tx)) {
        return tx.timestamp * 1000
    } else {
        return tx.blockTimestamp * 1000
    }
}
