import ERCNftToken from '@/js/ERCNftToken'

export interface ERCNftModuleState {
    lastScannedBlock: number
    scannedTokens: Set<string>
    evmAddress: string
    walletPrefix: string
    ercNftTokens: ERCNftToken[]
    ercNftTokensCustom: ERCNftToken[]
    ercNftTokenIds: ERCNftToken[]
    walletBalance: ERCNftWalletBalance
}

export interface ERCNftBalance {
    tokenId: string
    quantity: number
}

export interface ERCNftWalletBalance {
    [id: string]: ERCNftBalance[]
}

export type ERCNftTokenType = undefined | 'ERC721' | 'ERC1155'

export interface ERCNftTokenInput {
    type: ERCNftTokenType
    address: string
    chainId: number
    name: string
    symbol: string
    ercTokenIds: string[]
}
