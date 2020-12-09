export interface UrlFormType {
    url: string
}

export interface UtfFormType {
    text: string
}

export interface JsonFormType {
    data: string
}

export type NftMintFormType = UrlFormType | UtfFormType | JsonFormType
