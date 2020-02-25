import {SecpUTXO, UTXO, UTXOSet} from "slopes";
import Big from 'big.js';

export interface RootState {
    asset_meta: AssetMetaDict,
    isUpdateBalance: boolean,
    isAuth: boolean,
    privateKey: string,
    // publicKey: string,
    addresses: string[],
    selectedAddress: string,
    utxos: SecpUTXO[],
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

export interface AssetMetaDict {
    [key: string]: AssetMeta
}

export interface AssetMeta{
    name: string,
    symbol: string,
    denomination: number
}

export interface AssetType {
    name: string,
    symbol: string,
    balance: number,
    denomination: number
}

export interface Transaction {
    id: string,
    asset: string,
    amount: number,
    to: string,
    date: Date,
    status: string
}



export interface KeyFile{
    salt: string,
    pass_hash: string,
    keys: KeyFileKey[]
}

export interface KeyFileKey {
    key: string,
    nonce: string,
    address: string
}

export interface IssueBatchTxInput {
    changeAddresses: string[],
    toAddress: string,
    orders: BatchTxOrder[]
}

export interface BatchTxOrder {
    uuid: string,
    asset: AssetType,
    amount: Big
}

export interface IssueTxInput{
    asset: AssetType,
    assetId: string,
    amount: Big,
    toAddress: string,
    changeAddresses: string[],
}


export interface AddressUTXOs{
    [key:string]: SecpUTXO[]
}