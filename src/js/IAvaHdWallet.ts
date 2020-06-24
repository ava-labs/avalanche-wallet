
import HDKey from 'hdkey';
import {AVMKeyChain, AVMKeyPair, UTXO, UTXOSet} from "avalanche";


export interface IIndexKeyCache{
    [index:number]: AVMKeyPair
}


export interface AvaWallet {
    masterKey: AVMKeyPair
    utxoset: UTXOSet;

    getCurrentKey(): AVMKeyPair;
    getKeyChain(): AVMKeyChain;
}

export interface IAvaHdWallet extends AvaWallet{
    seed: string|null;
    hdKey: HDKey;
    hdIndex:number;
    keyChain: AVMKeyChain;
    chainId: string;
    utxoset: UTXOSet;
    // indexKeyCache:IIndexKeyCache;
    // indexChangeKeyCache:IIndexKeyCache;

    // getLastKeyIndex(): number;
    // getCurrentKey(): void;
    generateKey(): AVMKeyPair;
    onHdKeyReady(): void;
    onnetworkchange(): void;
    getUTXOs(): Promise<UTXOSet>;
}


export interface IAvaSingletonWallet extends AvaWallet{

}



