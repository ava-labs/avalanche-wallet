// A simple wrapper thar combines avalanche.js, bip39 and HDWallet

import {
    AVMKeyChain,
    AVMKeyPair,
    UTXOSet,
    TransferableInput,
    TransferableOutput, BaseTx, UnsignedTx, Tx
} from "avalanche";
import * as bip39 from "bip39";
import {ava, avm, bintools} from "@/AVA";
import {IAvaHdWallet, IIndexKeyCache} from "@/js/IAvaHdWallet";
import HDKey from 'hdkey';
import {Buffer} from "buffer/";
import BN from "bn.js";
import {ITransaction} from "@/components/wallet/transfer/types";



// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX: string = '9000';
const AVA_ACCOUNT_PATH: string = `m/44'/${AVA_TOKEN_INDEX}'/0'`; // Change and index left out
// const AVA_PATH: string = `m/44'/${AVA_TOKEN_INDEX}'/0'/0`;  // address_index is left out

const INDEX_RANGE: number = 20; // a gap of at least 20 indexes is needed to claim an index unused
const SCAN_SIZE: number = 70; // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE: number = SCAN_SIZE - INDEX_RANGE; // How many items are actually scanned

// Possible indexes for each request is
// SCAN_SIZE - INDEX_RANGE

export default class AvaHdWallet implements IAvaHdWallet{
    // type: wallet_type;
    masterKey: AVMKeyPair;
    seed:string | null;
    hdKey:HDKey;
    hdIndex:number;
    keyChain: AVMKeyChain;
    chainId: string;
    utxoset: UTXOSet;
    private indexKeyCache:IIndexKeyCache;
    private indexChangeKeyCache:IIndexKeyCache;

    // The master key from avalanche.js
    constructor(keypair: AVMKeyPair) {
        // this.type = 'hd';
        this.masterKey = keypair;
        this.chainId = keypair.getChainID();
        this.hdIndex = 0;
        this.seed = null;
        this.keyChain = new AVMKeyChain(this.chainId);
        this.utxoset = new UTXOSet();
        this.indexKeyCache = {};
        this.indexChangeKeyCache = {};
        let pk: Buffer = keypair.getPrivateKey();
        let pkHex: string = pk.toString('hex');

        let mnemonic: string = bip39.entropyToMnemonic(pkHex);

        // Generate Seed
        let seed: globalThis.Buffer = bip39.mnemonicToSeedSync(mnemonic);
        this.seed = seed.toString('hex');

        // Generate hd key from seed
        let hdkey: HDKey = HDKey.fromMasterSeed(seed);
        this.hdKey = hdkey;
        this.onHdKeyReady();
    }

    getCurrentKey():AVMKeyPair {
        let index: number = this.hdIndex;
        return this.getKeyForIndex(index);
    }

    generateKey(): AVMKeyPair{
        let newIndex: number = this.hdIndex+1;
        let newKey: AVMKeyPair = this.getKeyForIndex(newIndex);

        // Add to keychain
        this.keyChain.addKey(newKey);
        this.hdIndex = newIndex;
        return newKey;
    }

    // Called once master HD key is created.
    async onHdKeyReady(){
        this.hdIndex = await this.findAvailableIndex();
        this.keyChain = this.getKeyChain();
        this.getUTXOs();
    }

    // When the wallet connects to a different network
    async onnetworkchange(){
        this.utxoset = new UTXOSet();
        await this.onHdKeyReady();
    }

    async getUTXOs(): Promise<UTXOSet>{
        let addrs: Buffer[] = this.keyChain.getAddresses();
        let result: UTXOSet = await avm.getUTXOs(addrs);
        this.utxoset = result; // we can use local copy of utxos as cache for some functions

        // If last address has a utxo increment index
        let addr_now: AVMKeyPair = this.getCurrentKey();
        let lastIndexUtxos: string[] = result.getUTXOIDs([addr_now.getAddress()])
        if(lastIndexUtxos.length > 0){
            this.generateKey();
        }
        return result;
    }

    getUTXOSet(): UTXOSet {
        return this.utxoset;
    }

    getAllDerivedKeys(isInternal = false): AVMKeyPair[]{
        let set: AVMKeyPair[] = [];

        for(var i=0; i<this.hdIndex;i++){
            let key;

            if(isInternal){
                key = this.getKeyForIndex(i, true);
            }else{
               key = this.getKeyForIndex(i);
            }
            set.push(key);
        }
        return set;
    }

    getMasterKey(): AVMKeyPair {
        return this.masterKey;
    }

    // Scan internal indices and find a spot with no utxo
    getChangeAddress():string{
        let index: number = 0;
        let foundAddress: string|null = null;

        while(foundAddress===null){
            let key = this.getKeyForIndex(index,true);

            let utxoset = this.utxoset.getUTXOIDs([key.getAddress()]);
            if(utxoset.length===0){
                foundAddress = key.getAddressString();
            }
            index++;
        }

        return foundAddress;
    }


    async issueBatchTx(orders: ITransaction[], addr: string): Promise<string>{
        let fromAddrs: string[] = this.keyChain.getAddressStrings();
        let changeAddr: string = this.getChangeAddress();

        if(changeAddr === null){
            throw "Unable to issue transaction. Ran out of change index.";
        }

        let ins: TransferableInput[] = [];
        let outs: TransferableOutput[] = [];

        for(let i:number=0;i<orders.length;i++){
            let order: ITransaction = orders[i];
            let amt: BN = new BN(order.amount.toString());
            let baseTx: UnsignedTx = await avm.buildBaseTx(this.utxoset, amt,[addr], fromAddrs, [changeAddr], order.asset.id);
            let rawTx: BaseTx = baseTx.getTransaction();

            ins = ins.concat(rawTx.getIns());
            outs = outs.concat(rawTx.getOuts());
        }

        let chainId: Buffer = bintools.avaDeserialize(avm.getBlockchainID());
        let networkId: number = ava.getNetworkID();
        let baseTx: BaseTx = new BaseTx(networkId, chainId, outs, ins);
        const unsignedTx: UnsignedTx = new UnsignedTx(baseTx);
        const tx: Tx = unsignedTx.sign(this.keyChain);
        const txId: string = await avm.issueTx(tx);

        // TODO: Must update index after sending a tx
        // TODO: Index will not increase but it could decrease.
        // TODO: With the current setup this can lead to gaps in index space greater than scan size.
        this.hdIndex = await this.findAvailableIndex();
        this.keyChain = this.getKeyChain();

        return txId;
    }

    // returns a keychain that has all the derived private keys
    getKeyChain(): AVMKeyChain{
        let keychain: AVMKeyChain = new AVMKeyChain(this.chainId);

        for(let i:number=0; i<=this.hdIndex; i++){
            let key: AVMKeyPair = this.getKeyForIndex(i);
            let keyChange: AVMKeyPair = this.getKeyForIndex(i, true);

            keychain.addKey(key);
            keychain.addKey(keyChange);
        }
        return keychain;
    }

    getCurrentAddress(): string{
        return this.getCurrentKey().getAddressString();
    }

    async findAvailableIndex(start:number=0):Promise<number>{
        let keychainExternal: AVMKeyChain = new AVMKeyChain('X');
        let keychainInternal: AVMKeyChain = new AVMKeyChain('X');


        // Get keys for indexes start to start+scan_size
        for(let i:number=start;i<start+SCAN_SIZE;i++){
            // Derive Key and add to KeyChain
            // Scan both external and internal addresses
            let key: AVMKeyPair = this.getKeyForIndex(i);
            let keyInternal: AVMKeyPair = this.getKeyForIndex(i, true);
            keychainExternal.addKey(key);
            keychainInternal.addKey(keyInternal);
        }

        let externalAddrs: Buffer[] = keychainExternal.getAddresses();
        let internalAddrs: Buffer[] = keychainInternal.getAddresses();

        let utxoSetExternal: UTXOSet = await avm.getUTXOs(externalAddrs);
        let utxoSetInternal: UTXOSet = await avm.getUTXOs(internalAddrs);


        // let indexNow = start;
        // Scan UTXOs of these indexes and try to find a gao if INDEX_RANGE
        for(let i:number=0; i<externalAddrs.length-INDEX_RANGE; i++){
            let gapSize: number = 0;

            for(let n:number=0;n<0+INDEX_RANGE;n++){
                let scanIndex: number = i+n;


                let addrIn: Buffer = internalAddrs[scanIndex];
                let addrEx: Buffer = externalAddrs[scanIndex];

                let addrUTXOsIn: string[] = utxoSetInternal.getUTXOIDs([addrIn]);
                let addrUTXOsEx: string[] = utxoSetExternal.getUTXOIDs([addrEx]);


                if(addrUTXOsIn.length === 0 && addrUTXOsEx.length === 0){
                    gapSize++
                }else{
                    break;
                }
            }

            if(gapSize===INDEX_RANGE){
                return start+i;
            }
        }

        return await this.findAvailableIndex(start+SCAN_RANGE)
    }

    getKeyForIndex(index:number, isChange=false): AVMKeyPair{
        if(isChange){
            let cacheInternal: AVMKeyPair = this.indexChangeKeyCache[index];
            if(cacheInternal) return cacheInternal;
        }else{
            let cacheExternal: AVMKeyPair = this.indexKeyCache[index];
            if(cacheExternal) return cacheExternal;
        }

        let accountPath: string = AVA_ACCOUNT_PATH;

        // index is left out
        let derivationPath: string = accountPath+'/0';
        if(isChange){
            derivationPath = accountPath+'/1';
        }

        // TODO: This is a bottleneck
        let key: HDKey = this.hdKey.derive(derivationPath+`/${index}`) as HDKey;
        let keychain: AVMKeyChain = new AVMKeyChain('X');
        let pkHex: string = key.privateKey.toString('hex');
        let pkBuf: Buffer = new Buffer(pkHex, 'hex');
        let addr: Buffer = keychain.importKey(pkBuf);

        let keypair: AVMKeyPair = keychain.getKey(addr);

        if(!isChange){
            this.indexKeyCache[index] = keypair;
        }else{
            this.indexChangeKeyCache[index] = keypair;
        }
        return keypair;
    }
}
