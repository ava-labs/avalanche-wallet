
import HDKey from 'hdkey';
import {AVMKeyChain, AVMKeyPair, UTXOSet} from "slopes";


export interface IAvaHdWallet {
    masterKey: AVMKeyPair
    seed: string|null;
    hdKey: HDKey;
    keyChain: AVMKeyChain|null;
    chainId: string;


    // constructor(keypair: AVMKeyPair): void;

    // getLastKeyIndex(): number;
    // getCurrentKey(): void;
    getKeyChain(): AVMKeyChain;

    lookaheadHasBalance(index: number): Promise<boolean>;
    scanForLastIndex(): Promise<number>;
    // getUTXOs(): Promise<UTXOSet>
}
