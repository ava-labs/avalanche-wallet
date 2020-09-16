// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from "@obsidiansystems/hw-app-avalanche";

import * as bip39 from 'bip39';
import {Buffer, BN} from "avalanche";
import HDKey from 'hdkey';
import {ava, avm, bintools, pChain} from "@/AVA";
var bs58check = require('bs58check')
const bs58 = require('bs58')
var bippath = require('bip32-path')
import createHash from "create-hash";
import store from '@/store';

import bip32 from 'bip32';
import {HdHelper} from "@/js/HdHelper";
import {AssetAmountDestination, UTXO, UTXOSet as AVMUTXOSet} from "avalanche/dist/apis/avm/utxos";
import {UTXOSet as PlatformUTXOSet} from "avalanche/dist/apis/platformvm/utxos";
import {AvaWalletCore} from "@/js/IAvaHdWallet";
import {ITransaction} from "@/components/wallet/transfer/types";
import {
    BaseTx,
    KeyPair,
    SelectCredentialClass,
    TransferableInput,
    TransferableOutput,
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx
} from "avalanche/dist/apis/avm";

import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx
} from "avalanche/dist/apis/platformvm";

import {Credential, SigIdx, Signature, StandardTx, StandardUnsignedTx} from "avalanche/dist/common";
import {getPreferredHRP} from "avalanche/dist/utils";
import {KeyChain as PlatformVMKeyChain} from "avalanche/dist/apis/platformvm/keychain";
import {KeyChain as AVMKeyChain} from "avalanche/dist/apis/avm/keychain";

class LedgerWallet implements AvaWalletCore{
    app: AppAvax;
    internalHelper: HdHelper;
    externalHelper: HdHelper;
    platformHelper: HdHelper;
    utxoset: AVMUTXOSet;
    chainId: string;
    stakeAmount: BN;

    constructor(app: AppAvax, hdkey: HDKey) {
        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID();
        this.app = app;
        this.utxoset = new AVMUTXOSet();
        this.stakeAmount = new BN(0);

        this.externalHelper = new HdHelper('m/0', hdkey,undefined,true)
        this.internalHelper = new HdHelper('m/1', hdkey, undefined, true)
        this.platformHelper = new HdHelper('m/0', hdkey, 'P', true)
    }

    static async fromApp(app: AppAvax){
        let res = await app.getWalletExtendedPublicKey("44'/9000'/0'");

        let hd = new HDKey();
            hd.publicKey = res.public_key;
            hd.chainCode = res.chain_code;

        return new LedgerWallet(app, hd);
    }

    getDerivedAddresses(): string[] {
        let internal = this.internalHelper.getAllDerivedAddresses();
        let external = this.externalHelper.getAllDerivedAddresses();
        return internal.concat(external);
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

    getCurrentAddress(): string{
        return this.externalHelper.getCurrentAddress();
    }

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset;
    }

    async sign<UnsignedTx extends StandardUnsignedTx<any, any, any>>(unsignedTx: UnsignedTx, isAVM: boolean = true): Promise<StandardTx<any, any, any>>{

        let accountPath = bippath.fromString(`m/44'/9000'/0'`);

        let tx = unsignedTx.getTransaction();
        let txType = tx.getTxType();

        let txbuff = unsignedTx.toBuffer();
        let ins = tx.getIns();

        let items = ins;
        // If tx type is 17, sign ImportInputs instead
        if(txType===17 || txType===3){
            items = tx.getImportInputs();
        }
        let chainId = isAVM ? 'X':'P';

        console.log(txType, chainId, items)

        const msg:Buffer = Buffer.from(createHash('sha256').update(txbuff).digest());
        let paths: string[] = [];


        // Collect paths, and then ask ledger to sign
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            let sigidxs: SigIdx[] = item.getInput().getSigIdxs();
            let sources = sigidxs.map(sigidx => sigidx.getSource());
            let addrs:string[] = sources.map(source => {
                let hrp = getPreferredHRP(ava.getNetworkID());
                return  bintools.addressToString(hrp, chainId, source);
            })

            for (let j = 0; j < addrs.length; j++) {
                let srcAddr = addrs[j];
                let pathStr = this.getPathFromAddress(srcAddr); // returns change/index

                console.log(srcAddr);
                paths.push(pathStr)
            }
        }

        // Open the ledger modal to block view
        try{
            store.commit('Ledger/openModal',{
                title: `Sign Hash`,
                info: msg.toString('hex').toUpperCase()
            })

            let uniquePaths = paths.filter((val: any, i: number) => {
                return paths.indexOf(val) === i;
            })

            let bip32Paths = uniquePaths.map(path => {
                return bippath.fromString(path, false)
            })

            let sigMap = await this.app.signHash(accountPath, bip32Paths, msg)
            store.commit('Ledger/closeModal')

            const sigs:Credential[] = [];

            for (let i = 0; i < items.length; i++) {
                const sigidxs: SigIdx[] = items[i].getInput().getSigIdxs();
                const cred:Credential = SelectCredentialClass(items[i].getInput().getCredentialID());

                for (let j = 0; j < sigidxs.length; j++) {
                    let pathIndex = i+j;
                    let pathStr = paths[pathIndex];

                    let sigRaw = sigMap.get(pathStr);
                    let sigBuff = Buffer.from(sigRaw);
                    const sig:Signature = new Signature();
                    sig.fromBuffer(sigBuff);
                    cred.addSignature(sig);
                }
                sigs.push(cred);
            }

            let signedTx;
            if(isAVM){
                signedTx = new AVMTx(unsignedTx, sigs);
            }else{
                signedTx = new PlatformTx(unsignedTx, sigs);
            }
            return signedTx;
        }catch(e){
            store.commit('Ledger/closeModal')
            throw e;
        }
    }

    getPathFromAddress(address: string){
        let externalAddrs = this.externalHelper.getAllDerivedAddresses();
        let internalAddrs = this.internalHelper.getAllDerivedAddresses();
        let platformAddrs = this.platformHelper.getAllDerivedAddresses();

        let extIndex = externalAddrs.indexOf(address);
        let intIndex = internalAddrs.indexOf(address);
        let platformIndex = platformAddrs.indexOf(address);

        if(extIndex >= 0){
            return `0/${extIndex}`
        }else if(intIndex >= 0){
            return `1/${intIndex}`
        }else if(platformIndex >= 0){
            return `0/${platformIndex}`
        }else{
            throw 'Unable to find source address.'
        }
    }

    async issueBatchTx(orders: (ITransaction|UTXO)[], addr: string): Promise<string> {
        // TODO: Get new change index.
        if(this.getChangeAddress() === null){
            throw "Unable to issue transaction. Ran out of change index.";
        }


        let fromAddrsStr = this.getDerivedAddresses();
        let fromAddrs = fromAddrsStr.map(addrStr => {
            return bintools.parseAddress(addrStr, 'X');
        })
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
        let unsignedTx: AVMUnsignedTx;
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
            unsignedTx = new AVMUnsignedTx(baseTx);
        }

        let tx = await this.sign<AVMUnsignedTx>(unsignedTx)

        const txId: string = await avm.issueTx(tx);

        // TODO: Must update index after sending a tx
        // TODO: Index will not increase but it could decrease.
        // TODO: With the current setup this can lead to gaps in index space greater than scan size.
        setTimeout(async () => {
            // Find the new HD index
            this.internalHelper.updateHdIndex()
            this.externalHelper.updateHdIndex()
            this.platformHelper.updateHdIndex()
        }, 2000)

        return txId;
    }

    onnetworkchange(): void {
        this.externalHelper.onNetworkChange();
        this.internalHelper.onNetworkChange();
        this.platformHelper.onNetworkChange();
    }

    //TODO
    async chainTransfer(amt: BN, sourceChain: string = 'X'): Promise<string> {
        let fee = avm.getFee();
        let amtFee = amt.add(fee);

        // EXPORT
        let pId = pChain.getBlockchainID();
        let xId = avm.getBlockchainID();
        let txId;
        if(sourceChain === 'X'){
            // let keychain = this.getKeyChain();
            let toAddress = this.platformHelper.getCurrentAddress();
            let xChangeAddr = this.internalHelper.getCurrentAddress();
            let fromAddrs = this.getDerivedAddresses()

            let exportTx = await avm.buildExportTx(
                this.utxoset,
                amtFee,
                pId,
                [toAddress],
                fromAddrs,
                [xChangeAddr]
            );
            let tx = await this.sign<AVMUnsignedTx>(exportTx);
            return  avm.issueTx(tx);
        }else if(sourceChain === 'P'){
            // let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
            let utxoSet = this.platformHelper.utxoSet as PlatformUTXOSet;
            let toAddress = this.externalHelper.getCurrentAddress();
            let pChangeAddr = this.platformHelper.getCurrentAddress();
            let fromAddrs = this.platformHelper.getAllDerivedAddresses();


            let exportTx = await pChain.buildExportTx(
                utxoSet,
                amtFee,
                xId,
                [toAddress],
                fromAddrs,
                [pChangeAddr]
            );
            // let tx = exportTx.sign(keychain);
            let tx = await this.sign<PlatformUnsignedTx>(exportTx, false);
            return  pChain.issueTx(tx);
        }else{
            throw 'Invalid source chain.'
        }
    }

    //TODO
    delegate(nodeID: string, amt: BN, start: Date, end: Date, rewardAddress?: string): Promise<string> {
        return Promise.resolve("");
    }

    getChangeAddress(): string {
        return this.internalHelper.getCurrentAddress();
    }

    getPlatformRewardAddress(): string {
        return this.platformHelper.getAddressForIndex(0)
    }

    async getStake(): Promise<BN> {
        let addrs = this.platformHelper.getAllDerivedAddresses();
        return  pChain.getStake(addrs);
    }

    async importToPlatformChain(): Promise<string> {
        await this.platformHelper.updateHdIndex();
        const utxoSet = await this.platformHelper.getAtomicUTXOs() as PlatformUTXOSet;
        let pAddrs = this.platformHelper.getAllDerivedAddresses();
        // Owner addresses, the addresses we exported to
        let pToAddr = this.platformHelper.getCurrentAddress();

        console.log(utxoSet.getAllUTXOs(), pAddrs, pToAddr)
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
        const tx = await this.sign<PlatformUnsignedTx>(unsignedTx, false);

        // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        },3000);

        return  pChain.issueTx(tx);
    }

    async importToXChain(): Promise<string> {
        const utxoSet = await this.externalHelper.getAtomicUTXOs() as AVMUTXOSet;
        // let keyChain = this.getKeyChain() as AVMKeyChain;
        let xAddrs = this.getDerivedAddresses();
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
        let tx = await this.sign<AVMUnsignedTx>(unsignedTx);
        // const tx = unsignedTx.sign(keyChain);

        // // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        },3000);

        return avm.issueTx(tx);
    }

    //TODO
    validate(nodeID: string, amt: BN, start: Date, end: Date, delegationFee: number, rewardAddress?: string): Promise<string> {
        return Promise.resolve("");
    }

}

export {LedgerWallet};
