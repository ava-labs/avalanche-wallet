import AppBtc from "@ledgerhq/hw-app-btc";
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import {bintools} from "@/AVA";

class LedgerWallet {
    app: AppBtc
    async getPubKey(){
        // for(var i=0; i<20; i++){
        //     let k = await this.getKeyForIndex(i);
        //     console.log(i,k);
        // }
        let key = await this.getMasterPublicKey()
        let buf = bintools.b58ToBuffer(key);
        let hdKey = HDKey.fromMasterSeed(buf);

        let key1 = await this.getKeyForIndex(0);
        console.log(hdKey);
        console.log(hdKey.derive(`M/44'/9000'/0'/0/0`).publicKey.toString('hex'));
        console.log(key1)

        this.getMasterPublicKey();
    }

    async getMasterPublicKey(){
        const { bitcoinAddress } = await this.app.getWalletPublicKey();
        return bitcoinAddress;
    }
    async getKeyForIndex(i: number){
        const { bitcoinAddress } = await this.app.getWalletPublicKey(`44'/9000'/0'/0/${i}`);
        return bitcoinAddress;
    }


    constructor(transport) {
        let appBtc = new AppBtc(transport);
        this.app = appBtc;

        let key = this.getPubKey();




        transport.setDebugMode(true);
        console.log(transport)
    }
}

export {LedgerWallet};