// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from "@ledgerhq/hw-app-avalanche";

import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import {bintools} from "@/AVA";

class LedgerWallet {
    app: AppAvax

    async getPubKey(){
        // for(var i=0; i<20; i++){
        //     let k = await this.getKeyForIndex(i);
        //     console.log(i,k);
        // }
        let key = await this.getMasterPublicKey()
        let buf = bintools.b58ToBuffer(key);
        //@ts-ignore
        let hdKey = HDKey.fromMasterSeed(buf);

        let key1 = await this.getKeyForIndex(0);
        console.log(hdKey);
        console.log(hdKey.derive(`M/44'/9000'/0'/0/0`).publicKey.toString('hex'));
        console.log(key1)

        this.getMasterPublicKey();
    }

    async getMasterPublicKey(){
        const pubExt = await this.app.getWalletExtendedPublicKey();
        // const pubKey = await this.app.getWalletPublicKey("44'/9000'/0'/1/0");
        // console.log(pubKey)
        console.log(pubExt)
        return pubExt;
    }
    async getKeyForIndex(i: number){
        const address = await this.app.getWalletAddress(`44'/9000'/0'/0/${i}`);
        console.log(address);
        return address;
    }

    async init(){
        console.log(await this.app.getAppConfiguration());
        // await this.getKeyForIndex(0);
        let key = await this.getMasterPublicKey();
        // let id = await this.app.getWalletId();
        // console.log(id);
    }

    constructor(transport: any) {
        let app = new AppAvax(transport);
        this.app = app;
        console.log("Created Ledger Wallet", app)

        this.init();


        // transport.setDebugMode(true);
        // console.log(transport)
    }
}

export {LedgerWallet};
