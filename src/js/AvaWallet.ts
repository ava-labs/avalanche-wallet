import {AVMKeyPair} from "avalanche";
import AvaHdWallet from "@/js/AvaHdWallet";
import AvaSingletonWallet from "@/js/AvaSingletonWallet";
import {wallet_type} from './IAvaHdWallet';

export class AvaWallet {
    type: wallet_type
    constructor(keypair: AVMKeyPair) {
        this.type = "hd";
        // by default creates an HD wallet
        let hd = new AvaHdWallet(keypair);
        let singleton = new AvaSingletonWallet(keypair);
    }
}
