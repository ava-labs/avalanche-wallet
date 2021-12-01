import { BN } from 'avalanche'
export interface TransactionValueDict {
    [address: string]: number
}

export interface TransactionAssetsDict {
    [assetId: string]: {
        amount: BN
        addresses: Set<string>
    }
}
