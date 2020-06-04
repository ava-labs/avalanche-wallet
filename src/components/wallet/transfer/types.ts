import AvaAsset from "@/js/AvaAsset";


export interface ITransaction {
    uuid: string,
    asset: AvaAsset
    amount: number
}
