


// A simple wrapper thar combines slopes, bip39 and HDWallet

import {AVMKeyChain, KeyChain, AVMKeyPair, UTXOSet, UTXO, KeyPair} from "slopes";
import * as bip39 from "bip39";
import slopes from "slopes/typings/src/slopes";
import {ava, avm, bintools, keyChain} from "@/AVA";
import {IAvaHdWallet} from "@/js/IAvaHdWallet";
import HDKey from 'hdkey';
import {Buffer} from "buffer/";
import BN from "bn.js";


// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX = '1128';
const AVA_PATH = `m/44'/${AVA_TOKEN_INDEX}'/0'/0`;  // address_index is left out

const SCAN_SIZE = 20;


export default class AvaHdWallet implements IAvaHdWallet{
    masterKey: AVMKeyPair;
    seed:string | null;
    hdKey:HDKey;
    hdIndex:number;
    keyChain: AVMKeyChain;
    chainId: string;
    utxoset: UTXOSet;


    // The master key from slopes
    constructor(keypair: AVMKeyPair) {
        this.masterKey = keypair;
        this.chainId = keypair.getChainID();
        this.hdIndex = 0;
        this.seed = null;
        this.keyChain = new AVMKeyChain(this.chainId);
        this.utxoset = new UTXOSet();

        let pk = keypair.getPrivateKey();
        let pkHex = pk.toString('hex');

        let mnemonic = bip39.entropyToMnemonic(pkHex);


        console.log("Created HD wallet with: ",pkHex);

        // Generate Seed
        let seed = bip39.mnemonicToSeedSync(mnemonic);
        this.seed = seed.toString('hex');

        // Generate hd key from seed
        var hdkey = HDKey.fromMasterSeed(seed);
        this.hdKey = hdkey;
        this.onHdKeyReady();
    }

    getCurrentKey():AVMKeyPair {
        let index = this.hdIndex;
        return  this.getKeyForIndex(index);
    }

    // Called once master HD key is created.
    async onHdKeyReady(){
        this.hdIndex = await this.scanForLastIndex();
        this.keyChain = this.getKeyChain();
    }


    async getUTXOs(): Promise<UTXOSet>{
        let utxoset = await avm.getUTXOs(this.keyChain.getAddresses());
        this.utxoset = utxoset; // we can use local copy of utxos as cache for some functions
        return utxoset;
    }

    getChangeAddress():string{
        return 'yolo';
    }

    // Returns an index with no balance. Index returned is less than the lastUsedIndex
    // private getInternalUnusedIndex(){
    //     let usedAddrs = this.utxoset.getAddresses();
    //     let addrs = this.keyChain.getAddresses();
    //
    //     for(var i=0;i<addrs.length;i++){
    //         let addrBuf = addrs[i];
    //         let isUsed = usedAddrs.includes(addrBuf);
    //          // TODO: Can we use .includes on a Buffer array? want to compare value not reference
    //         if(!isUsed){
    //             return add
    //         }
    //     }
    // }

    async issueTx(amount: BN, to: string[], assetID: string){

        let utxoset = await this.getUTXOs();

        let fromAddresses = this.keyChain.getAddressStrings();
        let changeAddress = [this.getChangeAddress()];

        let tx = await avm.makeBaseTx(utxoset, amount, to, fromAddresses, changeAddress, assetID)
    }

    // returns a keychain that has all the derived private keys
    getKeyChain(): AVMKeyChain{
        let keychain = new AVMKeyChain(this.chainId);

        for(var i=0; i<this.hdIndex; i++){
            let key = this.getKeyForIndex(i);
            keychain.addKey(key);
        }
        return keychain;
    }

    getCurrentAddress(): string{
        return this.getCurrentKey().getAddressString();
    }

    async scanForLastIndex(): Promise<number>{
        let index = 0;

        while(await this.lookaheadHasBalance(index)){
            index++;
        }
        return index;
    }

    async lookaheadHasBalance(index: number): Promise<boolean>{
        let keychain = new AVMKeyChain('X');

        for(var i=index;i<index+SCAN_SIZE;i++){
            console.log("Scanning: ",i);

            // Derive Key and add to KeyChain
            let key = this.getKeyForIndex(i);
            keychain.addKey(key);
        }

        let addrs = keychain.getAddressStrings();
        let utxoSet = await avm.getUTXOs(addrs);
        let utxos = utxoSet.getAllUTXOs();

        return utxos.length !== 0;
    }

    getKeyForIndex(index:number): AVMKeyPair{

        let key = this.hdKey.derive(AVA_PATH+`/${index}`) as HDKey;

        let keychain = new AVMKeyChain('X');
        let pkHex = key.privateKey.toString('hex');
        let pkBuf = new Buffer(pkHex, 'hex');
        let addr = keychain.importKey(pkBuf);
        return keychain.getKey(addr);
    }
}
