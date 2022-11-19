import { UTXO } from '@c4tplatform/caminojs/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
