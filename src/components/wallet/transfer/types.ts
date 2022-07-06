import AvaAsset from '@/js/AvaAsset'
import Big from 'big.js'
import { BN } from '@c4tplatform/camino'
// import {UTXO} from "avalanche";

// type AssetType = "fungible" | "collectible"

export interface ITransaction {
    uuid: string
    asset: AvaAsset
    amount: BN
}

export interface INftTransaction {}

export interface ICurrencyInputDropdownValue {
    asset: AvaAsset | null
    amount: BN
}
