import { UTXO, UTXOSet } from 'avalanche/dist/apis/avm'

import AvaAsset from '@/js/AvaAsset'
import BN from 'bn.js'
import { AvaNftFamily } from '@/js/AvaNftFamily'
import { IWalletBalanceDict } from '@/store/types'
import { UTXO as AVMUTXO } from 'avalanche/dist/apis/avm/utxos'

export interface AssetsState {
    // isUpdateBalance: boolean
    assets: AvaAsset[]
    assetsDict: AssetsDict
    AVA_ASSET_ID: string | null
    nftFams: AvaNftFamily[]
    nftFamsDict: NftFamilyDict
    balanceDict: IWalletBalanceDict
    nftUTXOs: AVMUTXO[]
    nftMintUTXOs: AVMUTXO[]
}

export interface AssetDescriptions {
    [key: string]: AssetDescription
}

export interface AssetDescription {
    name: string
    symbol: string
    denomination: number
}

export interface NftFamilyDict {
    [id: string]: AvaNftFamily
}

export interface AssetsDict {
    [key: string]: AvaAsset
}

export interface AddressUtxoDict {
    [key: string]: [UTXO]
}

export interface IBalanceDict {
    [assetId: string]: BN
}

export interface AssetAPI {
    id: string
    chainID: string
    name: string
    symbol: string
    alias: string
    denomination: number
    currentSupply: string
    timestamp: string
}
