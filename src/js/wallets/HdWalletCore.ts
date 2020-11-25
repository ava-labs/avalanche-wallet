import {AvaWalletCore} from "@/js/wallets/IAvaHdWallet";
import {
    AssetAmountDestination, BaseTx,
    TransferableInput,
    TransferableOutput, Tx,
    UnsignedTx,
    UTXO,
    UTXOSet
} from "avalanche/dist/apis/avm";

import {BN, Buffer} from "avalanche";
import {ITransaction} from "@/components/wallet/transfer/types";
import {ava, avm, bintools, pChain} from "@/AVA";
import {UTXOSet as AVMUTXOSet} from "avalanche/dist/apis/avm/utxos";
import HDKey from "hdkey";
import {HdHelper} from "@/js/HdHelper";
import {UTXOSet as PlatformUTXOSet} from "avalanche/dist/apis/platformvm/utxos";
import createHash from "create-hash";

// A base class other HD wallets are based on.
// Mnemonic Wallet and LedgerWallet uses this

class HdWalletCore{
    chainId: string;
    utxoset: UTXOSet;
    stakeAmount: BN;

    internalHelper: HdHelper;
    externalHelper: HdHelper;
    platformHelper: HdHelper;

    constructor(accountHdKey: HDKey, isPublic=true) {
        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID();
        this.utxoset = new AVMUTXOSet();
        this.stakeAmount = new BN(0);

        this.externalHelper = new HdHelper('m/0', accountHdKey,undefined,isPublic)
        this.internalHelper = new HdHelper('m/1', accountHdKey, undefined, isPublic)
        this.platformHelper = new HdHelper('m/0', accountHdKey, 'P', isPublic)
    }

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset;
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

    getDerivedAddresses(): string[] {
        let internal = this.internalHelper.getAllDerivedAddresses();
        let external = this.externalHelper.getAllDerivedAddresses();
        return internal.concat(external);
    }

    // Returns addresses to check for history
    getHistoryAddresses(): string[] {
        let internalIndex = this.internalHelper.hdIndex;
        let externalIndex  = this.externalHelper.hdIndex;

        let internal = this.internalHelper.getAllDerivedAddresses(internalIndex);
        let external = this.externalHelper.getAllDerivedAddresses(externalIndex);
        return internal.concat(external);
    }


    getExtendedPlatformAddresses(): string[]{
        let index = this.platformHelper.hdIndex;
        let addrs = this.platformHelper.getAllDerivedAddresses(index+20);
        return addrs;
    }

    getCurrentAddress(): string{
        return this.externalHelper.getCurrentAddress();
    }

    getChangeAddress():string{
        return this.internalHelper.getCurrentAddress();
    }

    getPlatformRewardAddress(): string {
        return this.platformHelper.getCurrentAddress();
    }

    // helper method to get all stake for more than 256 addresses
    async getAllStake(addrs: string[]): Promise<BN>{
        if(addrs.length<=256){
            return await pChain.getStake(addrs);
        }else{
            //Break the list in to 1024 chunks
            let chunk = addrs.slice(0,256);
            let remainingChunk = addrs.slice(256);

            let chunkStake = await pChain.getStake(chunk);
            return chunkStake.add(await this.getAllStake(remainingChunk))
        }
    }

    async getStake(): Promise<BN> {
        // TODO: THIS IS A HACK
        // let xIndex = Math.max(this.externalHelper.hdIndex,this.internalHelper.hdIndex);
        // let pIndex = Math.max(this.platformHelper.hdIndex);
        // let uptoIndex = Math.max(xIndex, pIndex);
        let uptoIndex = this.platformHelper.hdIndex+40;
        let addrs = this.platformHelper.getAllDerivedAddresses(uptoIndex);
        let res = await this.getAllStake(addrs);
        this.stakeAmount = res;
        return res
    }

    onnetworkchange(): void {
        this.externalHelper.onNetworkChange();
        this.internalHelper.onNetworkChange();
        this.platformHelper.onNetworkChange();
    }

    async buildUnsignedTransaction(orders: (ITransaction|UTXO)[], addr: string, memo?:Buffer){
        // TODO: Get new change index.
        if(this.getChangeAddress() === null){
            throw "Unable to issue transaction. Ran out of change index.";
        }


        let fromAddrsStr: string[] = this.getDerivedAddresses();
        let fromAddrs: Buffer[] = fromAddrsStr.map(val => bintools.parseAddress(val, 'X'));
        let changeAddr: Buffer = bintools.stringToAddress(this.getChangeAddress());

        // TODO: use internal asset ID
        // This does not update on network change, causing issues
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
                    aad.addAssetAmount(assetId, amt, avm.getTxFee())
                    isFeeAdded = true;
                }else{
                    aad.addAssetAmount(assetId, amt, ZERO)
                }
            }
        }

        // If fee isn't added, add it
        if(!isFeeAdded){
            if(avm.getTxFee().gt(ZERO)){
                aad.addAssetAmount(AVAX_ID_BUF, ZERO, avm.getTxFee())
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

            unsignedTx = nftSet.buildNFTTransferTx(
                networkId,
                chainId,
                [TO_BUF],
                fromAddrs,
                fromAddrs, // change address should be something else?
                utxoIds,
                undefined,
                undefined,
                memo
                );

            let rawTx = unsignedTx.getTransaction();
            let outsNft = rawTx.getOuts()
            let insNft = rawTx.getIns()

            // TODO: This is a hackish way of doing this, need methods in avalanche.js
            //@ts-ignore
            rawTx.outs = outsNft.concat(outs);
            //@ts-ignore
            rawTx.ins = insNft.concat(ins);
        }else{
            let baseTx: BaseTx = new BaseTx(
                networkId,
                chainId,
                outs,
                ins,
                memo
            );
            unsignedTx = new UnsignedTx(baseTx);
        }
        return unsignedTx;
    }


}
export {HdWalletCore}
