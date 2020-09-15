// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from "@obsidiansystems/hw-app-avalanche";

import * as bip39 from 'bip39';
import {Buffer, BN} from "avalanche";
import HDKey from 'hdkey';
import {ava, avm, bintools} from "@/AVA";
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
    Tx,
    UnsignedTx
} from "avalanche/dist/apis/avm";

import {Credential, SigIdx, Signature, StandardTx} from "avalanche/dist/common";
import {getPreferredHRP} from "avalanche/dist/utils";

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

        // this.getStake();

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

    async sign(unsignedTx: UnsignedTx): Promise<Tx>{

        let accountPath = bippath.fromString(`m/44'/9000'/0'`);

        let tx = unsignedTx.getTransaction();
        let txbuff = unsignedTx.toBuffer();
        let ins = tx.getIns();

        const msg:Buffer = Buffer.from(createHash('sha256').update(txbuff).digest());
        let paths = [];
        let pathsStr: string[] = [];

        // Collect paths, and then ask ledger to sign
        for (let i = 0; i < ins.length; i++) {
            const sigidxs:SigIdx[] = ins[i].getInput().getSigIdxs();
            for (let j = 0; j < sigidxs.length; j++) {
                let srcAddrBuf = sigidxs[j].getSource();

                // Convert address to string and map the source to HD path
                let hrp = getPreferredHRP(ava.getNetworkID());
                let srcAddr = bintools.addressToString(hrp, 'X', srcAddrBuf);
                let pathStr = this.getPathFromAddress(srcAddr); // returns change/index
                let path = bippath.fromString(pathStr, false)

                if(pathsStr.includes(pathStr)) continue;

                pathsStr.push(pathStr)
                paths.push(path)
            }
        }


        // Open the ledger modal to block view
        try{
            store.commit('Ledger/openModal',{
                title: `Sign Hash`,
                info: msg.toString('hex').toUpperCase()
            })

            let sigMap = await this.app.signHash(accountPath, paths, msg)
            store.commit('Ledger/closeModal')

            const sigs:Credential[] = [];

            for (let i = 0; i < ins.length; i++) {
                const sigidxs: SigIdx[] = ins[i].getInput().getSigIdxs();
                const cred:Credential = SelectCredentialClass(ins[i].getInput().getCredentialID());

                for (let j = 0; j < sigidxs.length; j++) {
                    let pathIndex = i+j;
                    let pathStr = paths[pathIndex].toString(true);

                    let sigRaw = sigMap.get(pathStr);
                    let sigBuff = Buffer.from(sigRaw);
                    const sig:Signature = new Signature();
                    sig.fromBuffer(sigBuff);
                    cred.addSignature(sig);
                }
                sigs.push(cred);
            }

            let signedTx = new Tx(unsignedTx, sigs);
            return signedTx;
        }catch(e){
            store.commit('Ledger/closeModal')
            throw e;
        }
    }

    getPathFromAddress(address: string){
        let externalAddrs = this.externalHelper.getAllDerivedAddresses();
        let internalAddrs = this.internalHelper.getAllDerivedAddresses();

        let extIndex = externalAddrs.indexOf(address);
        let intIndex = internalAddrs.indexOf(address);

        if(extIndex >= 0){
            return `0/${extIndex}`
        }else if(intIndex >= 0){
            return `1/${intIndex}`
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
        // let fromAddrs: Buffer[] = keychain.getAddresses();
        // let fromAddrsStr: string[] = keychain.getAddressStrings();
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


        // Loop each input and sign with the Ledger

        console.log(unsignedTx.toBuffer().toString('hex'))

        // let customRaw = "0000000000000000000461258421397c0235bd6d67812a8b2c1cf33929500a7f6916bb2fc4ac646ac091000000026870b7d66ac32540311379e5b5dbad28ec7eb8ddbfc8f4d67299ebb48475907a00000007000000000000000100000000000000000000000100000001a172b1d4b09c7163dc09b2cb502966f8a7ecdcbf6870b7d66ac32540311379e5b5dbad28ec7eb8ddbfc8f4d67299ebb48475907a00000007000000003b4e7ebf00000000000000000000000100000001731a05fce8a4a4c50e83b1c02459692d8c5a4cc7000000012b945ba90bd7b22d3c5ccc6946881e951d238334a7da8987a38936ffa5accd28000000006870b7d66ac32540311379e5b5dbad28ec7eb8ddbfc8f4d67299ebb48475907a00000005000000003b5dc10000000001000000000000000400000000";
        // let customTx = new UnsignedTx();
        // customTx.fromBuffer(Buffer.from(customRaw,'hex'))

        // con

        let tx = await this.sign(unsignedTx)
        // let tx = await this.sign(customTx)
        console.log(tx);

        // let txRaw = unsignedTx.getTransaction();
        // let txbuff = txRaw.toBuffer();
        // const msg:Buffer = Buffer.from(createHash('sha256').update(txbuff).digest());
        //
        //
        // console.log(msg);
        // console.log(txRaw)
        // let hash = txRaw.toBuffer();
        // console.log(hash.toString('hex'))
        // let tx = await this.sign(msg);


        console.log(tx);
        // let keychain = this.getKeyChain();
        // const tx: Tx = unsignedTx.sign(keychain);

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

    onnetworkchange(): void {
        this.externalHelper.onNetworkChange();
        this.internalHelper.onNetworkChange();
        this.platformHelper.onNetworkChange();
    }

    //TODO
    chainTransfer(amt: BN, sourceChain: string): Promise<string> {
        return Promise.resolve("");
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

    //TODO
    getStake(): Promise<BN> {
        return Promise.resolve(new BN(0));
    }

    //TODO
    importToPlatformChain(): Promise<string> {
        return Promise.resolve("");
    }
    //TODO

    importToXChain(): Promise<string> {
        return Promise.resolve("");
    }

    //TODO
    validate(nodeID: string, amt: BN, start: Date, end: Date, delegationFee: number, rewardAddress?: string): Promise<string> {
        return Promise.resolve("");
    }

}

export {LedgerWallet};
