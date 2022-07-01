import { BN } from '@c4tplatform/avalanche'
export interface TransactionValueDict {
    [address: string]: number
}

export interface TransactionAssetsDict {
    [assetId: string]: {
        amount: BN
        addresses: Set<string>
    }
}
