import {SecpUTXO, UTXOSet} from "slopes";
import AvaAsset from "@/js/AvaAsset";

export interface AssetsState {
    isUpdateBalance: boolean
    utxo_set: UTXOSet|null
    utxos: SecpUTXO[]
    descriptions: AssetDescriptions
    assets: AvaAsset[]
    assetsDict: AssetsDict
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
    [key:string]: [SecpUTXO]
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
