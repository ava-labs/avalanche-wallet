
import HDKey from 'hdkey';
import {AVMKeyChain, AVMKeyPair, UTXO, UTXOSet} from "avalanche";


export interface IIndexKeyCache{
    [index:number]: AVMKeyPair
}

export interface IAvaHdWallet {
    masterKey: AVMKeyPair
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
    getKeyChain(): AVMKeyChain;
    getCurrentKey(): AVMKeyPair;
    generateKey(): AVMKeyPair;
    onHdKeyReady(): void;
    onnetworkchange(): void;
    getUTXOs(): Promise<UTXOSet>;

}
