export interface GetBalancesParams {
    addresses: string[]
    blockchainId: string
    network: 'mainnet' | 'fuji'
}

interface AssetAmount {
    assetId: string
    amount: string
}

export interface GetBalancesResponse {
    balances: {
        unlockedUnstaked?: AssetAmount[]
        unlockedStaked?: AssetAmount[]
        lockedPlatform?: AssetAmount[]
        lockedStakeable?: AssetAmount[]
        lockedUnstaked?: AssetAmount[]
        lockedStaked?: AssetAmount[]
        locked?: AssetAmount[]
        unlocked?: AssetAmount[]
    }
}

export interface ListStakingParams {
    addresses: string[]
    pageSize: number // Default = 10
    pageToken?: string // A page token, received from a previous list call. Provide this to retrieve the subsequent page.
    sortOrder: 'asc' | 'desc'
    blockchainId: string
    network: 'mainnet' | 'fuji'
}

export interface ListStakingResponse {
    nextPageToken?: string
    transactions: ListStakingTx[]
}

export interface ListStakingTx {
    txHash: string
    txType: 'AddDelegatorTx' | 'AddValidatorTx' | string
    blockTimestamp: number
    blockNumber: string
    blockHash: string
    consumedUtxos: UTXO[]
    emittedUtxos: UTXO[]
    value: AssetAmount[]
    amountBurned: AssetAmount[]
    amountStaked: AssetAmount[]
    startTimestamp: number
    endTimestamp: number
    delegationFeePercent: string
    nodeId: string
    subnetId: string
    estimatedReward: string
}

interface UTXO {
    fromTx: string
    addresses: string[]
    amount: string
    assetId: string
    utxoId: string
}
