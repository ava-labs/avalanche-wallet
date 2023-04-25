import { TransactionType } from './models'

export function filterDuplicateGlacierTxs(txs: TransactionType[]) {
    const ids: string[] = []
    return txs.filter((tx) => {
        if (ids.includes(tx.txHash)) return false
        ids.push(tx.txHash)
        return true
    })
}
