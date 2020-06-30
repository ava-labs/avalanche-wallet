// Functions to manage import/export of keystore files
import {KeyFile, KeyFileDecrypted, KeyFileKey, KeyFileKeyDecrypted} from "./IKeystore";
import {bintools, cryptoHelpers} from "@/AVA";
import {AvaWallet} from "@/js/AvaWallet";

const KEYSTORE_VERSION: string = '1.1';

async function readKeyFile(data:KeyFile, pass: string): Promise<KeyFileDecrypted>{
    const version: string = data.version || KEYSTORE_VERSION;

    let salt = bintools.avaDeserialize(data.salt);
    let pass_hash = data.pass_hash;

    let checkHash = await cryptoHelpers.pwhash(pass, salt);
    let checkHashString = bintools.avaSerialize(checkHash.hash);

    if (checkHashString !== pass_hash) {
        throw "INVALID_PASS";
    }



    let keys = data.keys;
    let keysDecrypt: KeyFileKeyDecrypted[] = [];

    for (var i = 0; i < keys.length; i++) {
        let key_data = keys[i];

        let key = bintools.avaDeserialize(key_data.key);
        let nonce = bintools.avaDeserialize(key_data.nonce);
        let address = key_data.address;
        let walletType = key_data.type || 'hd';

        let key_decrypt = await cryptoHelpers.decrypt(pass,key,salt,nonce);
        let key_string = bintools.avaSerialize(key_decrypt);

        keysDecrypt.push({
            key: key_string,
            type: walletType,
            address: address
        });
    }

    return {
        version: version,
        keys: keysDecrypt
    }
}


// Given an array of wallets and a password, return an encrypted JSON object that is the keystore file
async function makeKeyfile(wallets: AvaWallet[], pass:string): Promise<KeyFile>{
    let salt = await cryptoHelpers.makeSalt();
    let passHash = await cryptoHelpers.pwhash(pass, salt);

    let keys:KeyFileKey[] = [];

    for(var i=0; i<wallets.length;i++){
        let wallet = wallets[i];
        let pk = wallet.getMasterKey().getPrivateKey();
        let addr = wallet.getMasterKey().getAddressString();

        let pk_crypt = await cryptoHelpers.encrypt(pass,pk,salt);

        let key_data:KeyFileKey = {
            key: bintools.avaSerialize(pk_crypt.ciphertext),
            nonce: bintools.avaSerialize(pk_crypt.nonce),
            address: addr,
            type: wallet.type
        };
        keys.push(key_data);
    }

    let file_data:KeyFile = {
        version: KEYSTORE_VERSION,
        salt: bintools.avaSerialize(salt),
        pass_hash: bintools.avaSerialize(passHash.hash),
        keys: keys
    };
    return file_data;
}



export {
    readKeyFile,
    makeKeyfile,
}
