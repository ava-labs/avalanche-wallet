import {
    isTransactionC,
    isTransactionP,
    isTransactionX,
    TransactionType,
    CChainTransaction,
    XChainTransaction,
} from '@/js/Glacier/models'
import { SortOrder, PChainTransaction } from '@avalabs/glacier-sdk'

export function sortGlacierTxs(txs: TransactionType[], sortOrder: SortOrder = SortOrder.DESC) {
    return txs.sort((a, b) => {
        const timeA =
            (a as XChainTransaction | CChainTransaction).timestamp ||
            (a as PChainTransaction).blockTimestamp ||
            0

        const timeB =
            (b as XChainTransaction | CChainTransaction).timestamp ||
            (b as PChainTransaction).blockTimestamp ||
            0

        const orderVal = timeB - timeA

        const multiplier = sortOrder === SortOrder.DESC ? 1 : -1
        return orderVal * multiplier
    })
}
