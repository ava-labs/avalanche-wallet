
import {AvaWallet} from './IAvaHdWallet';
import {AVMKeyChain, AVMKeyPair, UTXOSet} from "avalanche";
import {avm, bintools} from "@/AVA";
import store from "@/store";

export default class AvaSingletonWallet implements AvaWallet {
    masterKey: AVMKeyPair;
    keyChain: AVMKeyChain;
    utxoset: UTXOSet;

    constructor(keypair: AVMKeyPair) {
        this.masterKey = keypair;
        this.utxoset = new UTXOSet();

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

        let assetIds = result.getAssetIDs();
        assetIds.forEach((idBuf) => {
            let assetId = bintools.avaSerialize(idBuf);
            //@ts-ignore
            let storeAsset = store.state.Assets.assetsDict[assetId];
            if(!storeAsset){
                store.dispatch('Assets/addUnknownAsset', assetId);
            }
        });

        return result;
    }
}
