


// A simple wrapper thar combines slopes, bip39 and HDWallet

import {AVMKeyChain, KeyChain, AVMKeyPair, UTXOSet, UTXO, KeyPair, AmountOutput} from "slopes";
import * as bip39 from "bip39";
import slopes from "slopes/typings/src/slopes";
import {ava, avm, bintools, keyChain} from "@/AVA";
import {IAvaHdWallet} from "@/js/IAvaHdWallet";
import HDKey from 'hdkey';
import {Buffer} from "buffer/";
import BN from "bn.js";

import store from '@/store';
import {AssetsDict} from "@/store/modules/assets/types";
import {BatchTxOrder} from "@/store/types";
import {ITransaction} from "@/components/wallet/transfer/types";


// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX = '9000';
const AVA_ACCOUNT_PATH = `m/44'/${AVA_TOKEN_INDEX}'/0'`; // Change and index left out
const AVA_PATH = `m/44'/${AVA_TOKEN_INDEX}'/0'/0`;  // address_index is left out

const INDEX_RANGE = 20; // a gap of at least 20 indexes is needed to claim an index unused
const SCAN_SIZE = 70; // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE = SCAN_SIZE - INDEX_RANGE; // How many items are actually scanned


// Possible indexes for each request is
// SCAN_SIZE - INDEX_RANGE
interface IIndexKeyCache{
    [index:number]: AVMKeyPair
}

export default class AvaHdWallet implements IAvaHdWallet{
    masterKey: AVMKeyPair;
    seed:string | null;
    hdKey:HDKey;
    hdIndex:number;
    keyChain: AVMKeyChain;
    chainId: string;
    utxoset: UTXOSet;
    private indexKeyCache:IIndexKeyCache;
    private indexChangeKeyCache:IIndexKeyCache;

    // The master key from slopes
    constructor(keypair: AVMKeyPair) {
        this.masterKey = keypair;
        this.chainId = keypair.getChainID();
        this.hdIndex = 0;
        this.seed = null;
        this.keyChain = new AVMKeyChain(this.chainId);
        this.utxoset = new UTXOSet();
        this.indexKeyCache = {};
        this.indexChangeKeyCache = {};
        let pk = keypair.getPrivateKey();
        let pkHex = pk.toString('hex');

        let mnemonic = bip39.entropyToMnemonic(pkHex);

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
        return this.getKeyForIndex(index);
    }

    generateKey(): AVMKeyPair{
        let newIndex = this.hdIndex+1;
        let newKey = this.getKeyForIndex(newIndex);

        // Add to keychain
        this.keyChain.addKey(newKey);
        this.hdIndex = newIndex;
        return newKey;
    }

    // Called once master HD key is created.
    async onHdKeyReady(){
        // this.hdIndex = await this.scanForLastIndex();
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
        let addrs = this.keyChain.getAddresses();
        let result = await avm.getUTXOs(addrs);
        this.utxoset = result; // we can use local copy of utxos as cache for some functions

        // Scan for unknown assets and add to store
        let assetIds = result.getAssetIDs();
            assetIds.forEach((idBuf) => {
                let assetId = bintools.avaSerialize(idBuf);
                //@ts-ignore
                let storeAsset = store.state.Assets.assetsDict[assetId];

                if(!storeAsset){
                    store.dispatch('Assets/addUnknownAsset', assetId);
                }
            });


        let addr_now = this.getCurrentKey();
        let lastIndexUtxos = result.getUTXOIDs([addr_now.getAddress()])
        if(lastIndexUtxos.length > 0){
            this.generateKey();
        }
        return result;
    }


    getChangeAddress():string|null{

        for(var i=0; i<this.hdIndex;i++){
            let key = this.getKeyForIndex(i,true);

            let utxoset = this.utxoset.getUTXOIDs([key.getAddress()]);
            if(utxoset.length===0){
                // console.log("Change index: ",i)
                return key.getAddressString();
            }
        }
        return null;
    }


    async issueBatchTx(orders: ITransaction[], addr: string): Promise<string[]>{
        let fromAddrs = this.keyChain.getAddressStrings();
        let changeAddr = this.getChangeAddress();

        if(changeAddr === null){
            alert("Unable to issue transaction. Ran out of change index.");
            return [];
        }

        let txIds = [];

        for(var i=0;i<orders.length;i++){
            let order = orders[i];
            let amt = new BN(order.amount.toString());
            let baseTx = await avm.makeBaseTx(this.utxoset, amt,[addr], fromAddrs, [changeAddr], order.asset.id);
            let signedTx = this.keyChain.signTx(baseTx);
            let txid = await avm.issueTx(signedTx);
            txIds.push(txid);
        }

        return txIds;
    }

    // returns a keychain that has all the derived private keys
    getKeyChain(): AVMKeyChain{
        let keychain = new AVMKeyChain(this.chainId);

        for(var i=0; i<=this.hdIndex; i++){
            let key = this.getKeyForIndex(i);
            let keyChange = this.getKeyForIndex(i, true);

            keychain.addKey(key);
            keychain.addKey(keyChange);
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


    async findAvailableIndex(start:number=0):Promise<number>{
        let keychain = new AVMKeyChain('X');

        for(var i=start;i<start+SCAN_SIZE;i++){
            // Derive Key and add to KeyChain
            let key = this.getKeyForIndex(i);
            keychain.addKey(key);
        }

        let addresses = keychain.getAddresses();

        let utxoSet = await avm.getUTXOs(addresses);

        for(i=0; i<addresses.length-INDEX_RANGE; i++){
            let gapSize = 0;


            for(var n=0;n<0+INDEX_RANGE;n++){
                let scanIndex = i+n;
                let addr = addresses[scanIndex];
                let addrUTXOs = utxoSet.getUTXOIDs([addr]);
                if(addrUTXOs.length === 0){
                    gapSize++
                }else{
                    break;
                }
            }

            // console.log(`Gap size ${i}: ${gapSize}`);
            if(gapSize===INDEX_RANGE){
                return i;
            }
        }

        return await this.findAvailableIndex(start+SCAN_RANGE)
    }

    async lookaheadHasBalance(index: number): Promise<boolean>{
        let keychain = new AVMKeyChain('X');
        // console.log("Scanning for index: ",index);

        for(var i=index;i<index+INDEX_RANGE;i++){
            // Derive Key and add to KeyChain
            let key = this.getKeyForIndex(i);
            keychain.addKey(key);
        }

        let addrs = keychain.getAddressStrings();
        let utxoSet = await avm.getUTXOs(addrs);
        let utxos = utxoSet.getAllUTXOs();

        return utxos.length !== 0;
    }

    getKeyForIndex(index:number, isChange=false): AVMKeyPair{
        if(isChange){
            let cacheInternal = this.indexChangeKeyCache[index];
            if(cacheInternal) return cacheInternal;
        }else{
            let cacheExternal = this.indexKeyCache[index];
            if(cacheExternal) return cacheExternal;
        }

        let accountPath = AVA_ACCOUNT_PATH;

        // index is left out
        let derivationPath = accountPath+'/0';
        if(isChange){
            derivationPath = accountPath+'/1';
        }

        let key = this.hdKey.derive(derivationPath+`/${index}`) as HDKey;
        let keychain = new AVMKeyChain('X');
        let pkHex = key.privateKey.toString('hex');
        let pkBuf = new Buffer(pkHex, 'hex');
        let addr = keychain.importKey(pkBuf);

        let keypair = keychain.getKey(addr);

        if(!isChange){
            this.indexKeyCache[index] = keypair;
        }else{
            this.indexChangeKeyCache[index] = keypair;
        }
        return keypair;
    }
}
