import AvaAsset from "@/js/AvaAsset";
import Big from "big.js";


export interface ITransaction {
    uuid: string,
    asset: AvaAsset
    amount: Big
}


export interface ICurrencyInputDropdownValue {
    asset: AvaAsset|null,
    amount: Big
}
