import Big from 'big.js';
import BN from 'bn.js';

import AvaAsset from "@/js/AvaAsset";
import AvaHdWallet from "@/js/AvaHdWallet";
import {ITransaction} from "@/components/wallet/transfer/types";

export interface RootState {
    isAuth: boolean,
    addresses: string[],
    selectedAddress: string,
    modals: ModalDict,
    activeWallet: null|AvaHdWallet
    wallets: AvaHdWallet[]
    address: String|null
    isLoadingPersistKeys: boolean,
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


interface ModalDict {
    [key: string]: Modal
}


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


export type SessionPersistFile = SessionPersistKey[];

export interface SessionPersistKey {
    key: string,
}

