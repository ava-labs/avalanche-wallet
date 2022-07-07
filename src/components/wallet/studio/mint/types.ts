import { UTXO } from '@c4tplatform/camino/dist/apis/avm'

export interface UrlFormType {
    url: string
}

export interface UtfFormType {
    text: string
}

export interface JsonFormType {
    data: string
}

export interface GenericFormType {
    data: {
        avalanche: IGenericNft
    }
}

export interface IGenericNft {
    version: number
    type: GenericNftTypes
    title: string
    radius?: number // to set border radius of the card
    desc?: string
    img: string
    img_b?: string // back image
    img_m?: string // mask image (for 3d layering)
}

export interface IGroupQuantity {
    id: string
    utxos: UTXO[]
}

export interface IGroupDict {
    [key: string]: UTXO[]
}
type GenericNftTypes = 'generic'

export type NftMintFormType = UrlFormType | UtfFormType | JsonFormType | GenericFormType
