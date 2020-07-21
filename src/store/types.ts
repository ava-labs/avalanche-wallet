import Big from 'big.js';
import BN from 'bn.js';

import AvaAsset from "@/js/AvaAsset";
import AvaHdWallet from "@/js/AvaHdWallet";
import {ITransaction} from "@/components/wallet/transfer/types";
import {KeyFile} from "@/js/IKeystore";

export interface RootState {
    isAuth: boolean,
    activeWallet: null|AvaHdWallet
    wallets: AvaHdWallet[]
    address: String|null
    volatileWallets: AvaHdWallet[] // will be forgotten when tab is closed
    warnUpdateKeyfile: boolean
}

interface Modal {
    open(): void,
    close(): void
}

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


// interface ModalDict {
//     [key: string]: Modal
// }


export interface AssetType {
    name: string,
    symbol: string,
    balance: number,
    denomination: number
}


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


export interface ImportKeyfileInput {
    password: string,
    data: KeyFile
}

export interface ExportWalletsInput {
    password: string,
    wallets: AvaHdWallet[]
}


export type SessionPersistFile = SessionPersistKey[];

export interface SessionPersistKey {
    key: string,
}

