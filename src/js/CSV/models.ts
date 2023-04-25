import { TransactionTypeName } from '@/js/Glacier/models'
import { BlockchainId } from '@avalabs/glacier-sdk'

export interface UtxoCsvRow {
    txID: string
    timeStamp: Date
    unixTime: string
    txType: TransactionTypeName
    chain: string
    isInput: boolean
    isOwner: boolean
    amount: string
    owners: string[]
    locktime: number
    threshold: number
    assetID: string
}
