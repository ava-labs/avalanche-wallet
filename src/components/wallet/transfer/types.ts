import AvaAsset from "@/js/AvaAsset";
import Big from "big.js";
import {UTXO} from "avalanche";

// type AssetType = "fungible" | "collectible"

export interface ITransaction {
    uuid: string,
    asset: AvaAsset
    amount: Big
}

export interface INftTransaction {

}


export interface ICurrencyInputDropdownValue {
    asset: AvaAsset|null,
    amount: Big
}
