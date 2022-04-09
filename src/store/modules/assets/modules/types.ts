import ERCNftToken from '@/js/ERCNftToken'
import { BN } from 'avalanche'

export interface ERCNftModuleState {
    ercNFTTokens: ERCNftToken[]
    ercNFTTokensCustom: ERCNftToken[]
    walletBalance: ERCNftWalletBalance
}

export interface ERCNftBalance {
    tokenId: string
    quantity: number
}

export interface ERCNftWalletBalance {
    [id: string]: ERCNftBalance[]
}

export interface ERCNftTokenInput {
    address: string
    chainId: number
    name: string
    symbol: string
    erc1155TokenIds: BN[]
}
