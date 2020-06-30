import {makeKeyfile, readKeyFile} from "../src/js/Keystore";
import AvaSingletonWallet from "../src/js/AvaSingletonWallet";
import AvaHdWallet from "@/js/AvaHdWallet";
import {AvaWallet} from "@/js/AvaWallet";

const avalanche = require("avalanche");
// import {cryptoHelpers} from "../src/AVA";
let ch = new avalanche.CryptoHelpers();

const chain_id = "GJABrZ9A6UQFpwjPU8MDxDd8vuyRoDVeDAXc694wJ5t3zEkhU";

let ip = 'localhost';
let port = '9650';
let protocol = 'http';
let network_id = '12345';



let ava = new avalanche.Avalanche(ip, parseInt(port), protocol, parseInt(network_id), chain_id);
let avm = ava.AVM();
let keyChain = avm.keyChain();
let bintools = avalanche.BinTools.getInstance();


let key1 = "2615ZoAYyfNu3sBEGMSBmWP6aNESSQxFxPX2bRsKb8fNbF1RSk";
let key2 = "2RAoq3GnqCjSmoZu2g3PuXowPWHRAQchpPkdHtpoZ3S7C4TBGe";


let keyStrings = [key1,key2];
let key1_buf = bintools.avaDeserialize(key1);
let key2_buf = bintools.avaDeserialize(key2);


keyChain.importKey(key1);
keyChain.importKey(key2);


// keychain.importKey(key1_buf);
// keychain.importKey(key2_buf);
//
// keychain

let file_data = {};

describe("Export/Import Keystore", () => {
   let pass = "randompasswordofmine";
   let keyChain = avm.keyChain();

   let addr1 = keyChain.makeKey();
   let key1 = keyChain.getKey(addr1);

   let addr2 = keyChain.makeKey();
   let key2 = keyChain.getKey(addr2);

   test('can encrypt/decrypt singleton',  async () => {

      let w1 = new AvaWallet(key1, 'singleton');
      let w2 = new AvaWallet(key2, 'singleton');

      let keyfile = await makeKeyfile([w1,w2],pass);
      let rawData = await readKeyFile(keyfile, pass);

      expect(rawData.keys[0].type).toEqual('singleton');
      expect(rawData.keys[0].key).toEqual(key1.getPrivateKeyString());

      expect(rawData.keys[1].type).toEqual('singleton');
      expect(rawData.keys[1].key).toEqual(key2.getPrivateKeyString());
   });

   test('can encrypt/decrypt hd', async () => {
      let w1 = new AvaWallet(key1, 'hd');
      let w2 = new AvaWallet(key2, 'hd');

      let keyfile = await makeKeyfile([w1,w2],pass);
      let rawData = await readKeyFile(keyfile, pass);

      expect(rawData.keys[0].type).toEqual('hd');
      expect(rawData.keys[0].key).toEqual(key1.getPrivateKeyString());

      expect(rawData.keys[1].type).toEqual('hd');
      expect(rawData.keys[1].key).toEqual(key2.getPrivateKeyString());
   });
});
