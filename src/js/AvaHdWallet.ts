// A simple wrapper thar combines avalanche.js, bip39 and HDWallet

import {
    AVMKeyPair,
    AVMKeyChain,
    UTXOSet as AVMUTXOSet,
    TransferableInput,
    TransferableOutput,
    BaseTx,
    UnsignedTx,
    Tx,
    UTXO,
    AssetAmountDestination
} from "avalanche/dist/apis/avm";

import {
    PlatformVMKeyChain,
    UTXOSet as PlatformUTXOSet
} from "avalanche/dist/apis/platformvm";
import {
    getPreferredHRP
} from "avalanche/dist/utils";


import * as bip39 from "bip39";
import {ava, avm, bintools, pChain} from "@/AVA";
import {IAvaHdWallet, IIndexKeyCache} from "@/js/IAvaHdWallet";
import HDKey from 'hdkey';
import {Buffer} from "buffer/";
import BN from "bn.js";
import {ITransaction} from "@/components/wallet/transfer/types";
import {HdHelper} from "@/js/HdHelper";
import {PlatformVMKeyPair} from "avalanche/dist/apis/platformvm";


// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX: string = '9000';
const AVA_ACCOUNT_PATH: string = `m/44'/${AVA_TOKEN_INDEX}'/0'`; // Change and index left out

const INDEX_RANGE: number = 20; // a gap of at least 20 indexes is needed to claim an index unused
const SCAN_SIZE: number = 70; // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE: number = SCAN_SIZE - INDEX_RANGE; // How many items are actually scanned

// Possible indexes for each request is
// SCAN_SIZE - INDEX_RANGE

export default class AvaHdWallet implements IAvaHdWallet{
    seed:string;
    hdKey:HDKey;
    chainId: string;
    utxoset: AVMUTXOSet;
    mnemonic: string;
    isLoading: boolean;
    stakeAmount: BN;
    internalHelper: HdHelper;
    externalHelper: HdHelper;
    platformHelper: HdHelper;

    // The master key from avalanche.js
    constructor(mnemonic: string) {
        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID();
        this.utxoset = new AVMUTXOSet();
        this.isLoading = false;

        this.mnemonic = mnemonic;
        this.stakeAmount = new BN(0);

        // Generate Seed
        let seed: globalThis.Buffer = bip39.mnemonicToSeedSync(mnemonic);
        this.seed = seed.toString('hex');

        // Generate hd key from seed
        let hdkey: HDKey = HDKey.fromMasterSeed(seed);
        this.hdKey = hdkey;


        this.externalHelper = new HdHelper(AVA_ACCOUNT_PATH+'/0', hdkey)
        this.internalHelper = new HdHelper(AVA_ACCOUNT_PATH+'/1', hdkey)
        this.platformHelper = new HdHelper(AVA_ACCOUNT_PATH+'/0', hdkey, 'P')

    }

    getCurrentKey():AVMKeyPair {
        return (this.externalHelper.getCurrentKey() as AVMKeyPair);
    }


    // When the wallet connects to a different network
    async onnetworkchange(){
        this.externalHelper.onNetworkChange();
        this.internalHelper.onNetworkChange();
        this.platformHelper.onNetworkChange();
    }



    async getUTXOs(): Promise<AVMUTXOSet>{
        let setInternal = await this.internalHelper.updateUtxos() as AVMUTXOSet;
        let setExternal = await this.externalHelper.updateUtxos() as AVMUTXOSet;
        let setPlatform = await this.platformHelper.updateUtxos() as PlatformUTXOSet;

        this.getStake();

        let joined = setInternal.merge(setExternal);
        this.utxoset = joined;
        return joined;
    }

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset;
    }

    getAllDerivedKeys(isInternal = false): AVMKeyPair[] | PlatformVMKeyPair[]{
        if(isInternal){
            return this.internalHelper.getAllDerivedKeys();
        }else{
            return this.externalHelper.getAllDerivedKeys();
        }
    }

    getMnemonic(): string {
        return this.mnemonic;
    }


    async getStake(){
        let keyChain = this.platformHelper.keyChain;
        let addrs = keyChain.getAddressStrings();
        let res = await pChain.getStake(addrs);
        this.stakeAmount = res;
    }

    // Scan internal indices and find a spot with no utxo
    getChangeAddress():string{
        return this.internalHelper.getCurrentAddress();
    }


    async validate(nodeID: string, amt: BN, start: Date, end: Date, delegationFee:number=0, rewardAddress?: string){
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
        const utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet;
        let pAddressStrings = keychain.getAddressStrings();

        let stakeAmount = amt;

        // If reward address isn't given use index 0 address
        if(!rewardAddress){
            rewardAddress = this.getPlatformRewardAddress();
        }

        // For change address use first available on the platform chain
        let changeKey = this.platformHelper.getFirstAvailableKey();

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000));
        let endTime = new BN(Math.round(end.getTime() / 1000));

        console.log(delegationFee);
        const unsignedTx = await pChain.buildAddValidatorTx(
            utxoSet,
            pAddressStrings, // from
            [changeKey.getAddressString()], // change
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress],
            delegationFee,
        );
        let tx = unsignedTx.sign(keychain);
        console.log(unsignedTx);
        // return ;
        let txId = await pChain.issueTx(tx);

        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        },3000);

        return txId;
    }

    getPlatformRewardAddress(): string{
        return this.platformHelper.getKeyForIndex(0).getAddressString();
    }

    // Delegates AVAX to the given node ID
    async delegate(nodeID: string, amt: BN, start: Date, end: Date, rewardAddress?: string){
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
        const utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet;
        let pAddressStrings = keychain.getAddressStrings();
        let stakeAmount = amt;

        // If reward address isn't given use index 0 address
        if(!rewardAddress){
            rewardAddress = this.getPlatformRewardAddress();
        }

        // For change address use first available on the platform chain
        let changeKey = this.platformHelper.getFirstAvailableKey();

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000));
        let endTime = new BN(Math.round(end.getTime() / 1000));

        const unsignedTx = await pChain.buildAddDelegatorTx(
            utxoSet,
            pAddressStrings,
            [changeKey.getAddressString()],
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress], // reward address
        );
        const tx =  unsignedTx.sign(keychain);
        let txId = await pChain.issueTx(tx);
        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        },3000);


        return txId;
    }

    async chainTransfer(amt: BN, sourceChain: string = 'X'){
        let fee = avm.getFee();
        let amtFee = amt.add(fee);


        // EXPORT
        let pId = pChain.getBlockchainID();
        let xId = avm.getBlockchainID();
        let txId;
        if(sourceChain === 'X'){
            let keychain = this.getKeyChain();
            let toAddress = this.platformHelper.getCurrentAddress();
            let xChangeAddr = this.internalHelper.getCurrentAddress();
            let fromAddrs = keychain.getAddressStrings();

            let exportTx = await avm.buildExportTx(
                this.utxoset,
                amtFee,
                pId,
                [toAddress],
                fromAddrs,
                [xChangeAddr]
            );
            let tx = exportTx.sign(keychain);
            txId = await avm.issueTx(tx);
        }else if(sourceChain === 'P'){
            let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
            let utxoSet = this.platformHelper.utxoSet as PlatformUTXOSet;
            let toAddress = this.externalHelper.getCurrentAddress();
            let pChangeAddr = this.platformHelper.getCurrentAddress();
            let fromAddrs = keychain.getAddressStrings();


            let exportTx = await pChain.buildExportTx(
                utxoSet,
                amtFee,
                xId,
                [toAddress],
                fromAddrs,
                [pChangeAddr]
            );
            let tx = exportTx.sign(keychain);
            txId = await pChain.issueTx(tx);
        }else{
            throw 'Invalid source chain.'
        }

        // console.log("Export Success: ",txId)
        return txId;
    }


    async importToPlatformChain(){
        await this.platformHelper.updateHdIndex();
        const utxoSet = await this.platformHelper.getAtomicUTXOs() as PlatformUTXOSet;
        let keyChain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
        let pAddrs = keyChain.getAddressStrings();
        // Owner addresses, the addresses we exported to
        let pToAddr = this.platformHelper.getCurrentAddress();

        const unsignedTx = await pChain.buildImportTx(
            utxoSet,
            pAddrs,
            avm.getBlockchainID(),
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined,

        );
        const tx = unsignedTx.sign(keyChain);
        const txid: string = await pChain.issueTx(tx);

        // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        },3000);

        return txid;
    }

    async importToXChain(){
        const utxoSet = await this.externalHelper.getAtomicUTXOs() as AVMUTXOSet;
        let keyChain = this.getKeyChain() as AVMKeyChain;
        let xAddrs = keyChain.getAddressStrings();
        let xToAddr = this.externalHelper.getCurrentAddress();

        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            xAddrs,
            pChain.getBlockchainID(),
            [xToAddr],
            [xToAddr],
            [xToAddr],
        );
        const tx = unsignedTx.sign(keyChain);
        const txid: string = await avm.issueTx(tx);

        // // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        },3000);

        return txid;
    }

    async issueBatchTx(orders: (ITransaction|UTXO)[], addr: string): Promise<string>{
        // TODO: Get new change index.
        if(this.getChangeAddress() === null){
            throw "Unable to issue transaction. Ran out of change index.";
        }

        let keychain = this.getKeyChain();

        let fromAddrs: Buffer[] = keychain.getAddresses();
        let fromAddrsStr: string[] = keychain.getAddressStrings();
        let changeAddr: Buffer = bintools.stringToAddress(this.getChangeAddress());

        const AVAX_ID_BUF = await avm.getAVAXAssetID();
        const AVAX_ID_STR = AVAX_ID_BUF.toString('hex');
        const TO_BUF = bintools.stringToAddress(addr);



        const aad:AssetAmountDestination = new AssetAmountDestination([TO_BUF], fromAddrs, [changeAddr]);
        const ZERO = new BN(0);
        let isFeeAdded = false;

        // Aggregate Fungible ins & outs
        for(let i:number=0;i<orders.length;i++){
            let order: ITransaction|UTXO = orders[i];

            if((order as ITransaction).asset){ // if fungible
                let tx: ITransaction = order as ITransaction;

                let assetId = bintools.cb58Decode(tx.asset.id)
                let amt: BN = tx.amount;

                if(assetId.toString('hex') === AVAX_ID_STR){
                    aad.addAssetAmount(assetId, amt, avm.getFee())
                    isFeeAdded = true;
                }else{
                    aad.addAssetAmount(assetId, amt, ZERO)
                }
            }
        }

        // If fee isn't added, add it
        if(!isFeeAdded){
            if(avm.getFee().gt(ZERO)){
                aad.addAssetAmount(AVAX_ID_BUF, ZERO, avm.getFee())
            }
        }

        const success: Error = this.getUTXOSet().getMinimumSpendable(aad);

        let ins: TransferableInput[] = [];
        let outs: TransferableOutput[] = [];
        if(typeof success === 'undefined'){
            ins = aad.getInputs();
            outs = aad.getAllOutputs();
        }else{
            throw success;
        }

        //@ts-ignore
        let nftUtxos:UTXO[] = orders.filter(val => {
            if((val as ITransaction).asset) return false;
            return true;
        });

        // If transferring an NFT, build the transaction on top of an NFT tx
        let unsignedTx: UnsignedTx;
        let networkId: number = ava.getNetworkID();
        let chainId: Buffer = bintools.cb58Decode(avm.getBlockchainID());

        if(nftUtxos.length > 0){
            let nftSet = new AVMUTXOSet();
                nftSet.addArray(nftUtxos);

            let utxoIds: string[] = nftSet.getUTXOIDs()

            // Sort nft utxos
            utxoIds.sort((a,b) => {
                if(a < b){
                    return -1;
                }else if(a > b){
                    return 1;
                }
                return 0;
            });

            unsignedTx = nftSet.buildNFTTransferTx(networkId,chainId,[TO_BUF], fromAddrs, fromAddrs, utxoIds);

            let rawTx = unsignedTx.getTransaction();
            let outsNft = rawTx.getOuts()
            let insNft = rawTx.getIns()

            // TODO: This is a hackish way of doing this, need methods in avalanche.js
            //@ts-ignore
            rawTx.outs = outsNft.concat(outs);
            //@ts-ignore
            rawTx.ins = insNft.concat(ins);
        }else{
            let baseTx: BaseTx = new BaseTx(networkId, chainId, outs, ins);
            unsignedTx = new UnsignedTx(baseTx);
        }

        const tx: Tx = unsignedTx.sign(keychain);
        const txId: string = await avm.issueTx(tx);

        // TODO: Must update index after sending a tx
        // TODO: Index will not increase but it could decrease.
        // TODO: With the current setup this can lead to gaps in index space greater than scan size.
        setTimeout(async () => {
            // Find the new HD index
            this.internalHelper.updateHdIndex()
            this.externalHelper.updateHdIndex()
            this.platformHelper.updateHdIndex()

            // Update UTXOs
            // this.internalHelper.updateUtxos();
            // this.externalHelper.updateUtxos();
            // this.platformHelper.updateUtxos();
        }, 2000)

        return txId;
    }

    // returns a keychain that has all the derived private keys
    getKeyChain(): AVMKeyChain{
        let internal = this.internalHelper.getAllDerivedKeys() as AVMKeyPair[];
        let external = this.externalHelper.getAllDerivedKeys() as AVMKeyPair[];

        let allKeys = internal.concat(external);
        let keychain: AVMKeyChain = new AVMKeyChain(getPreferredHRP(ava.getNetworkID()), this.chainId);

        for(var i=0; i<allKeys.length;i ++){
            keychain.addKey(allKeys[i]);
        }
        return keychain;
    }

    getCurrentAddress(): string{
        return this.externalHelper.getCurrentAddress();
    }

}
