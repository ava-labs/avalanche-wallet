import { PayloadBase } from 'avalanche/dist/utils'
import BN from 'bn.js'

export interface TransactionNftDict {
    [address: string]: PayloadBase
}

export interface TransactionValueDict {
    [address: string]: number
}

export interface TransactionAssetsDict {
    [assetId: string]: {
        amount: BN
        addresses: Set<string>
    }
}

export type ActionType = 'Sent' | 'Received' | 'Transferred'
