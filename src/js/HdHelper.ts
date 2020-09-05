import {AVMKeyChain, AVMKeyPair, UTXOSet as AVMUTXOSet} from "avalanche/dist/apis/avm";
import {UTXOSet as PlatformUTXOSet} from "avalanche/dist/apis/platformvm";
import {getPreferredHRP} from "avalanche/dist/utils";
import {ava, avm, bintools, pChain} from "@/AVA";
import HDKey from 'hdkey';
import {Buffer} from "buffer/";
import {PlatformVMKeyChain, PlatformVMKeyPair} from "avalanche/dist/apis/platformvm";


const INDEX_RANGE: number = 20; // a gap of at least 20 indexes is needed to claim an index unused

const SCAN_SIZE: number = 70; // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE: number = SCAN_SIZE - INDEX_RANGE; // How many items are actually scanned

type HelperChainId =  'X' | 'P';
class HdHelper {
    chainId: HelperChainId;
    keyChain: AVMKeyChain|PlatformVMKeyChain;
    keyCache: {
        [index: number]: AVMKeyPair|PlatformVMKeyPair
    }
    changePath: string
    masterKey: HDKey;
    hdIndex: number;
    utxoSet: AVMUTXOSet | PlatformUTXOSet;

    constructor(changePath: string, masterKey: HDKey, chainId: HelperChainId = 'X') {
        this.changePath = changePath;
        this.chainId = chainId;
        let hrp = getPreferredHRP(ava.getNetworkID());
        if(chainId==='X'){
            this.keyChain = new AVMKeyChain(hrp, chainId);
            this.utxoSet = new AVMUTXOSet();
        }else{
            this.keyChain = new PlatformVMKeyChain(hrp, chainId);
            this.utxoSet = new PlatformUTXOSet();
        }
        this.keyCache = {};
        this.masterKey = masterKey;
        this.hdIndex = 0;
        this.oninit();
    }

    async oninit(){
        this.hdIndex = await this.findAvailableIndex();
        this.updateKeychain();
        this.updateUtxos();
    }

    // When the wallet connects to a different network
    // Clear internal data and scan again
    async onNetworkChange(){
        this.clearCache();
        let hrp = getPreferredHRP(ava.getNetworkID());
        if(this.chainId === 'X'){
            this.keyChain = new AVMKeyChain(hrp, this.chainId);
            this.utxoSet = new AVMUTXOSet();
        }else{
            this.keyChain = new PlatformVMKeyChain(hrp, this.chainId);
            this.utxoSet = new PlatformUTXOSet();
        }
        this.hdIndex = 0;
        await this.oninit();
    }

    // Increments the hd index by one and adds the key
    // returns the new keypair
    incrementIndex(): AVMKeyPair|PlatformVMKeyPair{
        let newIndex: number = this.hdIndex+1;

        let newKey;
        if(this.chainId==='X'){
            let keychain = this.keyChain as AVMKeyChain;
            newKey = this.getKeyForIndex(newIndex) as AVMKeyPair;
            keychain.addKey(newKey);
        }else{
            let keychain = this.keyChain as PlatformVMKeyChain;
            newKey = this.getKeyForIndex(newIndex) as PlatformVMKeyPair;
            keychain.addKey(newKey);
        }

        this.hdIndex = newIndex;
        return newKey;
    }

    async updateHdIndex(){
        this.hdIndex = await this.findAvailableIndex();
        this.updateKeychain();
    }


    // Fetches the utxos for the current keychain
    // and increments the index if last index has a utxo
    async updateUtxos(): Promise<AVMUTXOSet|PlatformUTXOSet>{
        await this.updateHdIndex()

        let addrs: string[] = this.keyChain.getAddressStrings();
        let result: AVMUTXOSet|PlatformUTXOSet;

        if(this.chainId==='X'){
            result = await avm.getUTXOs(addrs);
        }else{
            result = await pChain.getUTXOs(addrs);
        }
        this.utxoSet = result; // we can use local copy of utxos as cache for some functions



        // If the hd index is full, increment
        let currentKey = this.getCurrentKey();
        let currentAddr = currentKey.getAddress();
        let curentUtxos = result.getUTXOIDs([currentAddr])

        if(curentUtxos.length>0){
            this.incrementIndex();
        }
        return result;
    }


    async getAtomicUTXOs(){
        let addrs: string[] = this.keyChain.getAddressStrings();
        // console.log(addrs);
        // console.log(avm.getBlockchainID());
        if(this.chainId === 'P'){
            let result: PlatformUTXOSet = await pChain.getUTXOs(addrs, avm.getBlockchainID());
            return result;
        }else{
            let result: AVMUTXOSet = await avm.getUTXOs(addrs, pChain.getBlockchainID());
            return result;
        }


        // if(this.chainId==='X'){
        //     result = await avm.getUTXOs(addrs);
        // }else{
        //     result = await pChain.getUTXOs(addrs);
        // }
        // this.utxoSet = result; // we can use local copy of utxos as cache for some functions


        // If the hd index is full, increment
        // let currentKey = this.getCurrentKey();
        // let currentAddr = currentKey.getAddress();
        // let curentUtxos = result.getUTXOIDs([currentAddr])
        //
        // if(curentUtxos.length>0){
        //     this.incrementIndex();
        // }
        // return result;
    }

    getUtxos(): AVMUTXOSet|PlatformUTXOSet{
        return this.utxoSet;
    }


    // Updates the helper keychain to contain keys upto the HD Index
    updateKeychain(): AVMKeyChain|PlatformVMKeyChain{
        let hrp = getPreferredHRP(ava.getNetworkID())
        let keychain: AVMKeyChain | PlatformVMKeyChain;

        if(this.chainId==='X'){
            keychain = new AVMKeyChain(hrp, this.chainId);
        }else{
            keychain = new PlatformVMKeyChain(hrp, this.chainId);
        }

        for(let i:number=0; i<=this.hdIndex; i++){
            let key : AVMKeyPair | PlatformVMKeyPair;
            if(this.chainId==='X') {
                key = this.getKeyForIndex(i) as AVMKeyPair;
                (keychain as AVMKeyChain).addKey(key);
            }else{
                key = this.getKeyForIndex(i) as PlatformVMKeyPair;
                (keychain as PlatformVMKeyChain).addKey(key);
            }
        }
        this.keyChain = keychain;
        return keychain;
    }

    getKeychain(){
        return this.keyChain;
    }

    // Returns all key pairs up to hd index
    getAllDerivedKeys(): AVMKeyPair[] | PlatformVMKeyPair[]{
        let set: AVMKeyPair[] | PlatformVMKeyPair[] = [];
        for(var i=0; i<=this.hdIndex;i++){
            if(this.chainId==='X'){
                let key = this.getKeyForIndex(i) as AVMKeyPair;
                (set as AVMKeyPair[]).push(key);
            }else{
                let key = this.getKeyForIndex(i) as PlatformVMKeyPair;
                (set as PlatformVMKeyPair[]).push(key);
            }
        }
        return set;
    }


    clearCache(){
        this.keyCache = {};
    }

    // Scans the address space for utxos and finds a gap of INDEX_RANGE
    async findAvailableIndex(start:number=0): Promise<number> {
        let hrp = getPreferredHRP(ava.getNetworkID());

        let tempKeychain : AVMKeyChain | PlatformVMKeyChain;
        if(this.chainId==='X'){
            tempKeychain = new AVMKeyChain(hrp,this.chainId);
        }else{
            tempKeychain = new PlatformVMKeyChain(hrp,this.chainId);
        }

        // Get keys for indexes start to start+scan_size
        for(let i:number=start;i<start+SCAN_SIZE;i++){
            if(this.chainId==='X'){
                let key = this.getKeyForIndex(i) as AVMKeyPair;
                (tempKeychain as AVMKeyChain).addKey(key);
            }else{
                let key = this.getKeyForIndex(i) as PlatformVMKeyPair;
                (tempKeychain as PlatformVMKeyChain).addKey(key);
            }

        }

        let addrs: string[] = tempKeychain.getAddressStrings();
        let utxoSet;

        if(this.chainId==='X'){
            utxoSet = await avm.getUTXOs(addrs);
        }else{
            utxoSet = await pChain.getUTXOs(addrs);
        }


        // Scan UTXOs of these indexes and try to find a gap of INDEX_RANGE
        for(let i:number=0; i<addrs.length-INDEX_RANGE; i++) {
            let gapSize: number = 0;
            for(let n:number=0;n<INDEX_RANGE;n++) {
                let scanIndex: number = i + n;
                let addr: string = addrs[scanIndex];
                let addrBuf = bintools.parseAddress(addr, this.chainId);
                let addrUTXOs: string[] = utxoSet.getUTXOIDs([addrBuf]);
                if(addrUTXOs.length === 0){
                    gapSize++
                }else{
                    // Potential improvement
                    // i = i+n;
                    break;
                }
            }

            // If we found a gap of 20, we can return the last fullIndex+1
            if(gapSize===INDEX_RANGE){
                return start+i;
            }
        }
        return await this.findAvailableIndex(start+SCAN_RANGE)
    }

    // Returns the key of the first index that has no utxos
    getFirstAvailableKey(){
        for(var i=0; i<this.hdIndex; i++){
            let key = this.getKeyForIndex(i);
            let utxoIds = this.utxoSet.getUTXOIDs([key.getAddress()]);
            if(utxoIds.length === 0){
                return key;
            }
        }
        return this.getCurrentKey();
    }

    getCurrentKey():AVMKeyPair|PlatformVMKeyPair {
        let index: number = this.hdIndex;
        return this.getKeyForIndex(index);
    }

    getCurrentAddress(): string{
        return this.getCurrentKey().getAddressString();
    }

    getKeyForIndex(index: number): AVMKeyPair|PlatformVMKeyPair {
        // If key is cached return that
        let cacheExternal: AVMKeyPair|PlatformVMKeyPair;

        if(this.chainId==='X'){
            cacheExternal = this.keyCache[index] as AVMKeyPair;
        }else{
            cacheExternal = this.keyCache[index] as PlatformVMKeyPair;
        }

        if(cacheExternal) return cacheExternal;

        let derivationPath: string = `${this.changePath}/${index.toString()}`;
        let key: HDKey = this.masterKey.derive(derivationPath) as HDKey;

        let pkHex: string = key.privateKey.toString('hex');
        let pkBuf: Buffer = new Buffer(pkHex, 'hex');

        let keypair = this.keyChain.importKey(pkBuf)

        // save to cache
        this.keyCache[index] = keypair;
        return keypair;
    }
}
export {HdHelper};
