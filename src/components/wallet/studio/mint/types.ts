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
    data: IGenericNft
}

export interface IGenericNft {
    version: number
    type: GenericNftTypes
    title: string
    desc?: string
    img: string
    img_b?: string // back image
    img_m?: string // mask image (for 3d layering)
}

type GenericNftTypes = 'generic'

export type NftMintFormType = UrlFormType | UtfFormType | JsonFormType | GenericFormType
