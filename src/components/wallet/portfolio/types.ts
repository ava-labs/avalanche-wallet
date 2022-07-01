import { UTXO } from '@c4tplatform/camino/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
