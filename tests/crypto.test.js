const slopes = require("slopes");
// import * as slopes from "slopes";
// import {cryptoHelpers} from "../src/AVA";
let ch = new slopes.CryptoHelpers();

const chain_id = "GJABrZ9A6UQFpwjPU8MDxDd8vuyRoDVeDAXc694wJ5t3zEkhU";

let ip = 'localhost';
let port = '9650';
let protocol = 'http';
let network_id = '12345';



let ava = new slopes.Slopes(ip, parseInt(port), protocol, parseInt(network_id), chain_id);
let avm = ava.AVM();
let keyChain = avm.keyChain();
let bintools = slopes.BinTools.getInstance();


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

test("Export",  async () => {
   let pass = "randompasswordofmine";

   let salt = await ch.makeSalt();
   let passHash = await ch.pwhash(pass, salt);


   let addrs = keyChain.getAddresses();
   let keys = [];

   for(var i=0; i<addrs.length; i++){
      let addBuff = addrs[i];

      let key = keyChain.getKey(addBuff);
      let pk = key.getPrivateKey();

      let pk_crypt = await ch.encrypt(pass,pk);


      let key_data = {
         key: bintools.avaSerialize(pk_crypt.ciphertext),
         nonce: bintools.avaSerialize(pk_crypt.nonce),
         salt: bintools.avaSerialize(pk_crypt.salt)
      }
      keys.push(key_data);
   }

   file_data = {
      pass_salt: bintools.avaSerialize(salt),
      pass_hash: bintools.avaSerialize(passHash.hash),
      keys: keys
   }

   // console.log(file_data);
});

test("Import", async ()=>{

   let pass = "randompasswordofmine"

   let passSalt = bintools.avaDeserialize(file_data.pass_salt);
   let passHash = bintools.avaDeserialize(file_data.pass_hash);

   // Check if hashing the password gives the same result
   let testHash = await ch.pwhash(pass,passSalt)

   let p1 = testHash.hash;

   // Make sure password hash works
   expect(p1).toStrictEqual(passHash);


   let keysHash = file_data.keys;

   for(var i=0 ;i<keysHash.length; i++){
      let keyData = keysHash[i];
      let salt = bintools.avaDeserialize(keyData.salt);
      let key = bintools.avaDeserialize(keyData.key);
      let nonce = bintools.avaDeserialize(keyData.nonce);

      let key_decrypt = await ch.decrypt(pass,key,salt,nonce)

      let key_string = bintools.avaSerialize(key_decrypt);

      expect(key_string).toEqual(keyStrings[i]);
   }
});