import HDKey from 'hdkey';
import {AVMKeyChain, AVMKeyPair, UTXOSet, UTXO} from "avalanche/dist/apis/avm";
import {ITransaction} from "@/components/wallet/transfer/types";

export type wallet_type = "hd" | "singleton";

export interface IIndexKeyCache{
    [index:number]: AVMKeyPair
}

// Every AVA Wallet must implement this.
export interface AvaWalletCore {
    // type: wallet_type;

    getCurrentKey(): AVMKeyPair;
    getKeyChain(): AVMKeyChain;
    getCurrentAddress(): string;
    onnetworkchange(): void;
    getUTXOs(): Promise<UTXOSet>;
    issueBatchTx(orders: ITransaction[], addr: string): Promise<string>;
}

export interface IAvaHdWallet extends AvaWalletCore{
    // masterKey: AVMKeyPair
    // utxoset: UTXOSet;
    seed: string;
    hdKey: HDKey;
    // hdIndex:number;
    // keyChain: AVMKeyChain;
    chainId: string;
    // generateKey(): AVMKeyPair;
    onHdKeyReady(): void;
    getUTXOSet(): UTXOSet;
    // getMasterKey(): AVMKeyPair;
    getMnemonic(): string;
}


export interface IAvaSingletonWallet extends AvaWalletCore{
    masterKey: AVMKeyPair
    utxoset: UTXOSet;
}



