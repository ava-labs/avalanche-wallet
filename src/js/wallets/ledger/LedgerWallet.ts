// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from "@obsidiansystems/hw-app-avalanche";

import * as bip39 from 'bip39';
import {Buffer, BN} from "avalanche";
import HDKey from 'hdkey';
import {avm, bintools} from "@/AVA";
var bs58check = require('bs58check')
const bs58 = require('bs58')

import bip32 from 'bip32';
import {HdHelper} from "@/js/HdHelper";
import {UTXO, UTXOSet as AVMUTXOSet} from "avalanche/dist/apis/avm/utxos";
import {UTXOSet as PlatformUTXOSet} from "avalanche/dist/apis/platformvm/utxos";
import {AvaWalletCore} from "@/js/IAvaHdWallet";
import {ITransaction} from "@/components/wallet/transfer/types";

class LedgerWallet implements AvaWalletCore{
    app: AppAvax;
    internalHelper: HdHelper;
    externalHelper: HdHelper;
    platformHelper: HdHelper;
    utxoset: AVMUTXOSet;
    chainId: string;
    stakeAmount: BN;

    constructor(app: AppAvax, xAccountPublicKey: string) {
        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID();
        // let app = new AppAvax(transport);
        this.app = app;
        this.utxoset = new AVMUTXOSet();
        this.stakeAmount = new BN(0);

        //@ts-ignore
        let hdkey = HDKey.fromExtendedKey(xAccountPublicKey);

        this.externalHelper = new HdHelper('m/0', hdkey,undefined,true)
        this.internalHelper = new HdHelper('m/1', hdkey, undefined, true)
        this.platformHelper = new HdHelper('m/0', hdkey, 'P', true)

        console.log("Created Ledger Wallet", app)
    }

    static async fromApp(app: AppAvax){
        let res = await app.getWalletExtendedPublicKey("44'/9000'/0'");
        let publicKey = res.public_key;

        // This is a dummy key for testing
        // This key is ledger  m/44'/9000'/0'/0
        publicKey = "xpub661MyMwAqRbcExL37Rz8w2Pe7LhLhj4bZPfK8vLuQSMTXj1zfoGTenTF1n7aWP2x2dmRSjmoy69vcdydraE3PC5UZpZNFSrZdTRrGQZXVy5";

        return new LedgerWallet(app, publicKey);
    }

    getDerivedAddresses(): string[] {
        let internal = this.internalHelper.getAllDerivedAddresses();
        let external = this.externalHelper.getAllDerivedAddresses();
        return internal.concat(external);
    }

    // async init(){
    //     let res = await this.app.getWalletExtendedPublicKey("44'/9000'/0'");
    //     let publicKey = res.public_key;
    //     let keyBuf = Buffer.from(publicKey)
    //
    //     //@ts-ignore
    //     // This is a dummy key for testing
    //     // This key is ledger  m/44'/9000'/0'/0
    //     let hdkey = HDKey.fromExtendedKey('xpub661MyMwAqRbcExL37Rz8w2Pe7LhLhj4bZPfK8vLuQSMTXj1zfoGTenTF1n7aWP2x2dmRSjmoy69vcdydraE3PC5UZpZNFSrZdTRrGQZXVy5');
    //
    //     this.externalHelper = new HdHelper('m/0', hdkey,undefined,true)
    //     this.internalHelper = new HdHelper('m/1', hdkey, undefined, true)
    //     this.platformHelper = new HdHelper('m/1', hdkey, 'P', true)
    // }

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

    //TODO
    issueBatchTx(orders: (ITransaction|UTXO)[], addr: string): Promise<string> {
        return Promise.resolve("");
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
