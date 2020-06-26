
import {AvaWalletCore, IAvaSingletonWallet, wallet_type} from './IAvaHdWallet';
import {
    AmountOutput,
    AVMKeyChain,
    AVMKeyPair, BaseTx,
    SecpInput,
    SecpOutput,
    TransferableInput,
    TransferableOutput, Tx, UnixNow, UnsignedTx, UTXO,
    UTXOSet
} from "avalanche";
import {ava, avm, bintools} from "@/AVA";
import {ITransaction} from "@/components/wallet/transfer/types";
import BN from "bn.js";

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

        return result;
    }

    async issueBatchTx(orders: ITransaction[], addr: string): Promise<string> {
        let fromAddrsStr = this.keyChain.getAddressStrings();
        let changeAddr = this.address;

        let ins:Array<TransferableInput> = [];
        let outs:Array<TransferableOutput> = [];

        for(var i=0;i<orders.length;i++){
            let order = orders[i];
            let amt = new BN(order.amount.toString());
            let assetId = order.asset.id;

            let baseTx = await avm.buildBaseTx(this.utxoset, amt,[addr], fromAddrsStr, [changeAddr], assetId);
            let rawTx = baseTx.getTransaction();

            ins = ins.concat(rawTx.getIns());
            outs = outs.concat(rawTx.getOuts());
        }

        let chainId = bintools.avaDeserialize(avm.getBlockchainID());
        let networkId = ava.getNetworkID();
        let baseTx = new BaseTx(networkId, chainId, outs, ins);
        const unsignedTx: UnsignedTx = new UnsignedTx(baseTx);
        const tx: Tx = unsignedTx.sign(this.keyChain);
        const txId: string = await avm.issueTx(tx);

        return txId;
    }
}
