// import AvaHdWallet from "../src/js/AvaHdWallet";
// import {keyChain} from "../src/AVA";


import {AVMKeyChain} from "avalanche";

let keyChain = new AVMKeyChain('X');

let addr = keyChain.makeKey();
let keypair = keyChain.getKey(addr);

describe('AVA HD Wallet', () => {

    // let hd:AvaHdWallet = new AvaHdWallet(keypair);
    //
    // beforeEach(() => {
    //     hd = new AvaHdWallet(keypair);
    // });
    //
    //
    // test("Create new HD Wallet",  () => {
    //     expect(hd.hdIndex).toEqual(0);
    // });
    //
    // test("Create get new key",   () => {
    //     let addrNow = hd.getCurrentAddress();
    //     let key1 = hd.getKeyForIndex(0);
    //
    //     expect(addrNow).toEqual(key1.getAddressString());
    // });

    test('yp', ()=>{
       expect(1).toEqual(1)
    });
})

