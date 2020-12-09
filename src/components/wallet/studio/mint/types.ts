export interface UrlFormType {
    url: string
}

export interface UtfFormType {
    text: string
}

export type NftMintFormType = UrlFormType | UtfFormType
