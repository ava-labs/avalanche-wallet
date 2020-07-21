import {makeKeyfile, readKeyFile} from "../src/js/Keystore";
import AvaHdWallet from "@/js/AvaHdWallet";

import { Buffer } from 'buffer/';
import { KeyFile, KeyFileDecrypted } from '../src/js/IKeystore';
import {
   Avalanche,
   AVM,
   AVMKeyChain,
   AVMKeyPair
 } from "avalanche" 

const chain_id:string = "GJABrZ9A6UQFpwjPU8MDxDd8vuyRoDVeDAXc694wJ5t3zEkhU";
const ip:string = 'localhost';
const port:string = '9650';
const protocol:string = 'http';
const network_id:string = '12345';
const avalanche:Avalanche = new Avalanche(ip, parseInt(port), protocol, parseInt(network_id), chain_id);
const avm:AVM = avalanche.AVM();

// A 2.0 and 3.0 Keystore version of the same keys
// Password is: 111111111

const KEYFILE_2 = `{"version":"2.0","salt":"2SjQXSMR87tBvYqbkwTFL61gEdwR","pass_hash":"2NJf6rqPshCU69hMkPEMBLBZLfBKshHy68cWgNY7kNmAM988Qt","keys":[{"key":"C8JG3QvhF9XUiXMyAmQoTfTkWg5UySMPKeCrkGH8u67HrqStNtBxZyDxLY6NrSS8k51Fg3V","iv":"Fc8Xyxmhd2X55sgjy4aTxN","address":"X-EAZkJNdFBjVQQ7zS81hWCnRHfMKf3vpYH"},{"key":"p52F7MGpyicfG2c7RXuKKKpUE7X9qjLX7qx2ju3mei58jU4vCxRQpjcR6RvSKbozphMT1s8","iv":"N6fYr5gT4TJfB6Tzs9oLMN","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"}]}`
const KEYFILE_3 = `{"version":"3.0","salt":"kwkVtmPkafnwWbp65nYs2z9cQeN","pass_hash":"2gid7yJzvyg2Mz4HUJLh3jvgumpDJmRu2PBopqHYacVjwisp1g","keys":[{"key":"PiLrcsSBZ1fBE9v3axsHycfhta6NwMf56qqGKgxswr4VSNGL3kZUQG8YCCRG2q7QDN8y5mp","iv":"L7MojgHmudo2WpbMCdfgCg","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"},{"key":"uDvvzSQQxkFGhYUvDcRFmWtKbqJEZ8swKgMx7Ba3eWUoTMaikvV2oD2jUFzaS35WdP8rtqF","iv":"AN8nLnaK84rfoKXtxm6evy","address":"X-EAZkJNdFBjVQQ7zS81hWCnRHfMKf3vpYH"},{"key":"g1AcoW7iXtiui87GVy466NkkHsGfQRRptfVLyboBUDtMart1NktRLfzZDxhVifBvU2Vxtzi","iv":"U3VZnEr8HgiD3rcNW6Abko","address":"X-7r1aDs2jiJHr1reFfLFzzKrprZruXVzqM"}],"warnings":["This address listed in this file is for internal wallet use only. DO NOT USE THIS ADDRESS"]}`

// const crypto = require('crypto');

// global.crypto = crypto;
// Object.defineProperty(global.self, 'crypto', {
//    value: {
//       // @ts-ignore
//       getRandomValues: arr => crypto.randomBytes(arr.length)
//    }
// });


describe("Export/Import Keystore", () => {
   const pass:string = "randompasswordofmine";
   const keyChain:AVMKeyChain = avm.keyChain();

   const addr1:Buffer = keyChain.makeKey();
   const key1:AVMKeyPair = keyChain.getKey(addr1);

   const addr2:Buffer = keyChain.makeKey();
   const key2:AVMKeyPair = keyChain.getKey(addr2);

   test('can encrypt/decrypt hd', async () => {
      const w1:AvaHdWallet = new AvaHdWallet(key1);
      const w2:AvaHdWallet = new AvaHdWallet(key2);

      const keyfile:KeyFile = await makeKeyfile([w1,w2],pass);
      const rawData:KeyFileDecrypted = await readKeyFile(keyfile, pass);

      expect(rawData.keys[0].key).toEqual(key1.getPrivateKeyString());
      expect(rawData.keys[1].key).toEqual(key2.getPrivateKeyString());
   });

   test("Can import 2.0", async () => {

   });

   test("Can import 3.0", async () => {

   })
});

