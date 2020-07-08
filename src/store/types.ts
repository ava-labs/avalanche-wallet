import {UTXO, UTXOSet} from "avalanche";
import Big from 'big.js';
import BN from 'bn.js';
import {Module} from "vuex";
import {AssetsState} from "@/store/modules/assets/types";
import AvaAsset from "@/js/AvaAsset";
import AvaHdWallet from "@/js/AvaHdWallet";
import {ITransaction} from "@/components/wallet/transfer/types";
// import {wallet_type} from "@/js/IAvaHdWallet";
// import AvaSingletonWallet from "@/js/AvaSingletonWallet";
// import {AvaWallet} from "@/js/AvaWallet";

export interface RootState {
    // asset_meta: AssetMetaDict,
    // Assets?: Module<AssetsState,RootState>,
    isAuth: boolean,
    // privateKey: string,
    addresses: string[],
    selectedAddress: string,
    modals: ModalDict,
    // rememberKey: boolean,
    activeWallet: null|AvaHdWallet
    wallets: AvaHdWallet[]
    address: String|null
    isLoadingPersistKeys: boolean,
}

interface Modal {
    open(): void,
    close(): void
}

// export interface UTXODict {
//     [key: string]: SecpUTXO
// }


export interface IWalletBalanceDict {
    [assetId: string]: BN
}

export interface IWalletBalanceItem{
    id: string,
    amount: BN
}

export interface IWalletAssetsDict {
    [assetId: string]: AvaAsset
}


interface ModalDict {
    [key: string]: Modal
}
//
// export interface BalanceDict {
//     [key: string]: AssetType
// }
//
// interface AssetBalance {
//     id: string,
//     balance: number,
//     usd_price: number,
// }
//
// export interface AssetMetaDict {
//     [key: string]: AssetMeta
// }

// export interface AssetMeta{
//     name: string,
//     symbol: string,
//     denomination: number
// }

export interface AssetType {
    name: string,
    symbol: string,
    balance: number,
    denomination: number
}

// export interface Transaction {
//     id: string,
//     asset: string,
//     amount: number,
//     to: string,
//     date: Date,
//     status: string
// }





export interface IssueBatchTxInput {
    toAddress: string,
    orders: ITransaction[]
}

export interface BatchTxOrder {
    uuid: string,
    asset: AssetType,
    amount: Big
}

export interface IssueTxInput{
    asset: AvaAsset,
    assetId: string,
    amount: BN,
    toAddress: string,
    changeAddresses: string[],
}


// export interface AddWalletInput {
//     pk: string,
//     type: wallet_type
// }
// export interface rememberWalletIn {
//     wallets: AvaHdWallet[],
//     password: string
// }


export type SessionPersistFile = SessionPersistKey[];

export interface SessionPersistKey {
    key: string,
}
// export interface AddressUTXOs{
//     [key:string]: SecpUTXO[]
// }
