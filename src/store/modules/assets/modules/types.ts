import ERC721Token from '@/js/ERC721Token'

export interface Erc721ModuleState {
    erc721Tokens: ERC721Token[]
    erc721TokensCustom: ERC721Token[]
    walletBalance: ERC721WalletBalance
}

export interface ERC721WalletBalance {
    [id: string]: string[]
}

export interface ERC721TokenInput {
    address: string
    chainId: number
    name: string
    symbol: string
}
