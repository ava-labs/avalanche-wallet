import { UTXO } from '@c4tplatform/avalanche/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
