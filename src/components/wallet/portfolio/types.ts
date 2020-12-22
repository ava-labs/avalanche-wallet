import { UTXO } from 'avalanche/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
