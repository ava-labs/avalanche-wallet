import {UTXO, UTXOSet} from "avalanche";
import AvaAsset from "@/js/AvaAsset";
import BN from "bn.js";

export interface AssetsState {
    isUpdateBalance: boolean
    utxo_set: UTXOSet|null
    utxos: UTXO[]
    descriptions: AssetDescriptions
    assets: AvaAsset[]
    assetsDict: AssetsDict
    balanceDict: IBalanceDict
    AVA_ASSET_ID: string | null,
}

export interface AssetDescriptions {
    [key: string]: AssetDescription
}

export interface AssetDescription {
    name: string,
    symbol: string,
    denomination: number
}


export interface AssetsDict {
    [key:string]: AvaAsset
}

export interface AddressUtxoDict {
    [key:string]: [UTXO]
}

export interface IBalanceDict {
    [assetId:string]: BN
}


export interface AssetAPI {
    "id": string
    "chainID": string
    "name": string
    "symbol": string
    "alias": string
    "denomination": number
    "currentSupply": string
    "timestamp": string
}
