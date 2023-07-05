import {
    BlockchainId,
    Network,
    PChainId,
    PChainTransaction,
    XChainLinearTransaction,
    XChainNonLinearTransaction,
    CChainExportTransaction,
    CChainImportTransaction,
    SortOrder,
    Utxo,
    PChainUtxo,
} from '@avalabs/glacier-sdk'

export type XChainTransaction = XChainLinearTransaction | XChainNonLinearTransaction
export interface GetBalancesParams {
    addresses: string[]
    blockchainId: BlockchainId
    network: Network
}

export interface ListStakingParams {
    addresses: string[]
    pageSize: number // Default = 10
    pageToken?: string // A page token, received from a previous list call. Provide this to retrieve the subsequent page.
    sortOrder: SortOrder
    blockchainId: PChainId
    network: Network
}

export type TransactionTypeName =
    | 'AddDelegatorTx'
    | `AddPermissionlessValidatorTx`
    | `AddSubnetValidatorTx`
    | `AddValidatorTx`
    | 'AdvanceTimeTx'
    | 'BaseTx'
    | 'CreateAssetTx'
    | 'CreateChainTx'
    | 'CreateSubnetTx'
    | 'ExportTx'
    | 'ImportTx'
    | 'OperationTx'
    | 'RemoveSubnetValidatorTx'
    | 'RewardValidatorTx'
    | string

export type TransactionType =
    | XChainTransaction
    | PChainTransaction
    | CChainImportTransaction
    | CChainExportTransaction

export type UtxoType = Utxo | PChainUtxo

export function isTransactionX(tx: TransactionType): tx is XChainTransaction {
    return (
        (tx as XChainTransaction).amountUnlocked !== undefined &&
        (tx as XChainTransaction).memo !== undefined &&
        (tx as CChainImportTransaction).evmOutputs == undefined
    )
}

export function isTransactionP(tx: TransactionType): tx is PChainTransaction {
    return (tx as PChainTransaction).blockTimestamp !== undefined
}

export function isCChainImportTransaction(tx: TransactionType): tx is CChainImportTransaction {
    return (tx as CChainImportTransaction).evmOutputs !== undefined
}

export function isCChainExportTransaction(tx: TransactionType): tx is CChainExportTransaction {
    return (tx as CChainExportTransaction).evmInputs !== undefined
}

export function isTransactionC(
    tx: TransactionType
): tx is CChainExportTransaction | CChainImportTransaction {
    return isCChainImportTransaction(tx) || isCChainExportTransaction(tx)
}

export type CChainTransaction = CChainImportTransaction | CChainExportTransaction

export interface GetTransactionsParams {
    addresses: string[]
    blockchainId: BlockchainId
    network: Network
    pageSize?: number
    pageToken?: string
    sortOrder?: SortOrder
}

export function isPChainUtxo(utxo: UtxoType): utxo is PChainUtxo {
    return (utxo as PChainUtxo).staked !== undefined
}

export function isUtxo(utxo: UtxoType): utxo is Utxo {
    return (utxo as Utxo).asset !== undefined
}
