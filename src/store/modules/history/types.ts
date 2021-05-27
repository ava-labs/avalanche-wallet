export interface HistoryState {
    transactions: ITransactionData[]
    allTransactions: ITransactionData[]
    isUpdating: boolean
    isUpdatingAll: boolean
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
    rewarded: boolean
    rewardedTime: string
    timestamp: string
    txFee: number
    type: TransactionType
    validatorStart: number
    validatorEnd: number
    validatorNodeID: string
}

export interface ITransactionDataProcessed extends ITransactionData {
    isMonthChange: boolean
    isDayChange: boolean
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
    groupID: number
    id: string
    locktime: number
    payload?: string
    outputIndex: number
    outputType: number
    redeemingTransactionID: string
    rewardUtxo: boolean
    stake?: boolean
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
