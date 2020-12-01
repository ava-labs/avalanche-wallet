export interface HistoryState {
    transactions: ITransactionData[]
    isUpdating: boolean
}

export interface ITransactionData {
    chainID: string
    id: string
    inputTotals: {
        [key: string]: string
    }
    inputs: TransactionInput[]

    outputTotals: {
        [key: string]: string
    }
    outputs: UTXO[]

    reusedAddressTotals: null
    timestamp: string
    type: string
}

interface TransactionInput {
    credentials: any[]
    output: UTXO
}

interface UTXO {
    addresses: string[]
    amount: string
    assetID: string
    id: string
    locktime: number
    outputIndex: number
    outputType: number
    redeemingTransactionID: string
    threshold: number
    timestamp: string
    transactionID: string
}
