import {AVMKeyChain, AVMKeyPair, UTXOSet} from "avalanche/dist/apis/avm";
import {getPreferredHRP} from "avalanche/dist/utils";
import {ava, avm} from "@/AVA";
import HDKey from 'hdkey';
import {Buffer} from "buffer/";


const INDEX_RANGE: number = 20; // a gap of at least 20 indexes is needed to claim an index unused

const SCAN_SIZE: number = 70; // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE: number = SCAN_SIZE - INDEX_RANGE; // How many items are actually scanned


class HdHelper {
    chainId: string;
    keyChain: AVMKeyChain;
    keyCache: {
        [index: number]: AVMKeyPair
    }
    changePath: string
    masterKey: HDKey;
    hdIndex: number;
    utxoSet: UTXOSet;

    constructor(changePath: string, masterKey: HDKey, chainId: string = 'X') {
        this.changePath = changePath;
        this.chainId = chainId;
        let hrp = getPreferredHRP(ava.getNetworkID());
        this.keyChain = new AVMKeyChain(hrp, chainId);
        this.keyCache = {};
        this.masterKey = masterKey;
        this.hdIndex = 0;
        this.utxoSet = new UTXOSet();
        this.oninit();
    }

    async oninit(){
        this.hdIndex = await this.findAvailableIndex();
        this.updateKeychain();
        this.updateUtxos();

        console.log("Hellper index: ",this.hdIndex);
    }

    // When the wallet connects to a different network
    // Clear internal data and scan again
    async onNetworkChange(){
        this.clearCache();
        this.utxoSet = new UTXOSet();
        this.hdIndex = 0;
        await this.oninit();
    }

    // Increments the hd index by one and adds the key
    // returns the new keypair
    incrementIndex(): AVMKeyPair{
        let newIndex: number = this.hdIndex+1;
        let newKey: AVMKeyPair = this.getKeyForIndex(newIndex);
        this.keyChain.addKey(newKey);
        this.hdIndex = newIndex;
        return newKey;
    }


    // Fetches the utxos for the current keychain
    // and increments the index if last index has a utxo
    async updateUtxos(): Promise<UTXOSet>{
        let addrs: Buffer[] = this.keyChain.getAddresses();
        let result: UTXOSet = await avm.getUTXOs(addrs);
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

    getUtxos(): UTXOSet{
        return this.utxoSet;
    }


    // Updates the helper keychain to contain keys upto the HD Index
    updateKeychain(): AVMKeyChain{
        let hrp = getPreferredHRP(ava.getNetworkID())
        let keychain: AVMKeyChain = new AVMKeyChain(hrp, this.chainId);

        for(let i:number=0; i<=this.hdIndex; i++){
            let key: AVMKeyPair = this.getKeyForIndex(i);
            keychain.addKey(key);
        }
        this.keyChain = keychain;
        return keychain;
    }

    getKeychain(){
        return this.keyChain;
    }

    // Returns all key pairs up to hd index
    getAllDerivedKeys(): AVMKeyPair[]{
        let set: AVMKeyPair[] = [];
        for(var i=0; i<this.hdIndex;i++){
            let key = this.getKeyForIndex(i);
            set.push(key);
        }
        return set;
    }


    clearCache(){
        this.keyCache = {};
    }

    async findAvailableIndex(start:number=0): Promise<number> {
        let hrp = getPreferredHRP(ava.getNetworkID());
        let tempKeychain = new AVMKeyChain(hrp,this.chainId);

        // Get keys for indexes start to start+scan_size
        for(let i:number=start;i<start+SCAN_SIZE;i++){
            let key: AVMKeyPair = this.getKeyForIndex(i);
            tempKeychain.addKey(key);
        }

        let addrs: Buffer[] = tempKeychain.getAddresses();
        let utxoSet: UTXOSet = await avm.getUTXOs(addrs);

        // Scan UTXOs of these indexes and try to find a gap of INDEX_RANGE
        for(let i:number=0; i<addrs.length-INDEX_RANGE; i++) {
            let gapSize: number = 0;
            for(let n:number=0;n<INDEX_RANGE;n++) {
                let scanIndex: number = i + n;
                let addr: Buffer = addrs[scanIndex];
                let addrUTXOs: string[] = utxoSet.getUTXOIDs([addr]);
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

    getCurrentKey():AVMKeyPair {
        let index: number = this.hdIndex;
        return this.getKeyForIndex(index);
    }

    getCurrentAddress(): string{
        return this.getCurrentKey().getAddressString();
    }

    getKeyForIndex(index: number): AVMKeyPair {
        // If key is cached return that
        let cacheExternal: AVMKeyPair = this.keyCache[index];
        if(cacheExternal) return cacheExternal;

        let derivationPath: string = `${this.changePath}/${index.toString()}`;
        // console.log(derivationPath);
        let key: HDKey = this.masterKey.derive(derivationPath) as HDKey;

        let pkHex: string = key.privateKey.toString('hex');
        let pkBuf: Buffer = new Buffer(pkHex, 'hex');

        let keypair = this.keyChain.importKey(pkBuf)


        // console.log(keypair.getAddressString())
        // save to cache
        this.keyCache[index] = keypair;

        return keypair;
    }
}
export {HdHelper};