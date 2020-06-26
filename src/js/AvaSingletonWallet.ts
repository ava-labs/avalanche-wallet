
import {AvaWalletCore, IAvaSingletonWallet, wallet_type} from './IAvaHdWallet';
import {AVMKeyChain, AVMKeyPair, UTXOSet} from "avalanche";
import {avm, bintools} from "@/AVA";
import store from "@/store";
import {ITransaction} from "@/components/wallet/transfer/types";
import BN from "bn.js";
// import avalanche from "avalanche/typings/src/avalanche";


// const avm = avalanche.

export default class AvaSingletonWallet implements IAvaSingletonWallet {
    masterKey: AVMKeyPair;
    keyChain: AVMKeyChain;
    utxoset: UTXOSet;
    type: wallet_type;
    address: string;

    constructor(keypair: AVMKeyPair) {
        this.type = "singleton";
        this.masterKey = keypair;
        this.utxoset = new UTXOSet();
        this.address = keypair.getAddressString();

        this.keyChain = new AVMKeyChain('X');
        this.keyChain.addKey(keypair);

        this.getUTXOs();
    }

    getCurrentKey(): AVMKeyPair {
        return this.masterKey;
    }

    getKeyChain(): AVMKeyChain {
        return this.keyChain;
    }

    getCurrentAddress(): string{
        return this.masterKey.getAddressString();
    }

    async onnetworkchange() {
        this.utxoset = new UTXOSet();
        this.getUTXOs();
    }

    async getUTXOs(): Promise<UTXOSet> {
        let addrs = this.keyChain.getAddresses();
        let result = await avm.getUTXOs(addrs);
        this.utxoset = result; // we can use local copy of utxos as cache for some functions

        // let assetIds = result.getAssetIDs();
        // assetIds.forEach((idBuf) => {
        //     let assetId = bintools.avaSerialize(idBuf);
        //     //@ts-ignore
        //     let storeAsset = store.state.Assets.assetsDict[assetId];
        //     if(!storeAsset){
        //         store.dispatch('Assets/addUnknownAsset', assetId);
        //     }
        // });

        return result;
    }

    async issueBatchTx(orders: ITransaction[], addr: string): Promise<string[]> {
        let fromAddrs = [this.address];
        let changeAddr = this.address;

        let txIds = [];

        for(var i=0;i<orders.length;i++){
            let order = orders[i];
            let amt = new BN(order.amount.toString());
            let baseTx = await avm.buildBaseTx(this.utxoset, amt,[addr], fromAddrs, [changeAddr], order.asset.id);
            let signedTx = this.keyChain.signTx(baseTx);
            let txid = await avm.issueTx(signedTx);
            txIds.push(txid);
        }

        return txIds;    }
}
