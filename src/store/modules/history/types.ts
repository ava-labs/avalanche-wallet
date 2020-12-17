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
    memo: string
    outputTotals: {
        [key: string]: string
    }
    outputs: UTXO[]

    reusedAddressTotals: null
    timestamp: string
    txFee: number
    type: TransactionType
}

interface TransactionInput {
    credentials: any[]
    output: UTXO
}

export interface UTXO {
    addresses: string[]
    amount: string
    assetID: string
    chainID: string
    id: string
    locktime: number
    payload?: string
    outputIndex: number
    outputType: number
    redeemingTransactionID: string
    threshold: number
    timestamp: string
    transactionID: string
}

export type TransactionType =
    | 'base'
    | 'create_asset'
    | 'operation'
    | 'import'
    | 'export'
    | 'add_validator'
    | 'add_subnet_validator'
    | 'add_delegator'
    | 'create_chain'
    | 'create_subnet'
    | 'pvm_import'
    | 'pvm_export'
    | 'advance_time'
    | 'reward_validator'
