import {SecpUTXO, UTXO, UTXOSet} from "slopes";

export interface RootState {
    isUpdateBalance: boolean,
    isAuth: boolean,
    privateKey: string,
    // publicKey: string,
    address: string,
    utxos: UTXODict,
    utxo_set: UTXOSet|null,
    modals: ModalDict,
    assets: AssetType[],
    tx_history: Transaction[]
}

interface Modal {
    open(): void,
    close(): void
}

export interface UTXODict {
    [key: string]: SecpUTXO
}

interface ModalDict {
    [key: string]: Modal
}

export interface BalanceDict {
    [key: string]: AssetType
}

interface AssetBalance {
    id: string,
    balance: number,
    usd_price: number,
}

export interface AssetNamesDict {
    [key: string]: AssetName
}

export interface AssetName{
    name: string,
    symbol: string
}

export interface AssetType {
    name: string,
    symbol: string,
    balance: number,
    usd_price: number,
    btc_price: number,
    ava_price: number,
    // address: string
}

export interface Transaction {
    id: string,
    asset: string,
    amount: number,
    to: string,
    date: Date,
    status: string
}




export interface IssueTxInput{
    assetId: string,
    amount: number,
    toAddress: string,
}