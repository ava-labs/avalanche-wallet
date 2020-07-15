import {makeKeyfile, readKeyFile} from "../src/js/Keystore";
import AvaHdWallet from "@/js/AvaHdWallet";

const avalanche = require("avalanche");

const chain_id = "GJABrZ9A6UQFpwjPU8MDxDd8vuyRoDVeDAXc694wJ5t3zEkhU";

let ip = 'localhost';
let port = '9650';
let protocol = 'http';
let network_id = '12345';

let ava = new avalanche.Avalanche(ip, parseInt(port), protocol, parseInt(network_id), chain_id);
let avm = ava.AVM();



// var nodeCrypto = require('crypto');
// global.crypto = nodeCrypto;
// window = {
//    crypto: nodeCrypto
// }


// let key1 = "2615ZoAYyfNu3sBEGMSBmWP6aNESSQxFxPX2bRsKb8fNbF1RSk";
// let key2 = "2RAoq3GnqCjSmoZu2g3PuXowPWHRAQchpPkdHtpoZ3S7C4TBGe";
//
// keyChain.importKey(key1);
// keyChain.importKey(key2);

const crypto = require('crypto');

global.crypto = crypto;
Object.defineProperty(global.self, 'crypto', {
   value: {
      // @ts-ignore
      getRandomValues: arr => crypto.randomBytes(arr.length)
   }
});

console.log(self.crypto);

describe("Export/Import Keystore", () => {
   let pass = "randompasswordofmine";
   let keyChain = avm.keyChain();

   let addr1 = keyChain.makeKey();
   let key1 = keyChain.getKey(addr1);

   let addr2 = keyChain.makeKey();
   let key2 = keyChain.getKey(addr2);

   test('can encrypt/decrypt hd', async () => {
      let w1 = new AvaHdWallet(key1);
      let w2 = new AvaHdWallet(key2);

      let keyfile = await makeKeyfile([w1,w2],pass);
      let rawData = await readKeyFile(keyfile, pass);

      expect(rawData.keys[0].key).toEqual(key1.getPrivateKeyString());
      expect(rawData.keys[1].key).toEqual(key2.getPrivateKeyString());
   });
});
