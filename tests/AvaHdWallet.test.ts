import AvaHdWallet from "../src/js/AvaHdWallet";
import {keyChain} from "../src/AVA";



let addr = keyChain.makeKey();
let keypair = keyChain.getKey(addr);

describe('AVA HD Wallet', () => {

    let hd:AvaHdWallet = new AvaHdWallet(keypair);

    beforeEach(() => {
        hd = new AvaHdWallet(keypair);
    });


    test("Create new HD Wallet",  async () => {
        expect(hd.hdIndex).toEqual(0);
    });

    test("Create get new key",  async () => {
        let addrNow = hd.getCurrentAddress();
        let key1 = hd.getKeyForIndex(0);

        expect(addrNow).toEqual(key1.getAddressString());
    });
})

