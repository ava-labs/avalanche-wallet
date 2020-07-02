// Functions to manage import/export of keystore files
import {KeyFile, KeyFileDecrypted, KeyFileKey, KeyFileKeyDecrypted} from "./IKeystore";
import {bintools, cryptoHelpers} from "@/AVA";
import {AvaWallet} from "@/js/AvaWallet";
import {Buffer} from "buffer/";
import { wallet_type } from './IAvaHdWallet';
import AvaHdWallet from "@/js/AvaHdWallet";

const KEYSTORE_VERSION: string = '1.1';

interface IHash {
    salt: Buffer;
    hash: Buffer;
}

interface PKCrypt {
    salt: Buffer;
    nonce: Buffer;
    ciphertext: Buffer;
}

async function readKeyFile(data:KeyFile, pass: string): Promise<KeyFileDecrypted>{
    const version: string = data.version || KEYSTORE_VERSION;

    let salt: Buffer = bintools.avaDeserialize(data.salt);
    let pass_hash: string = data.pass_hash;

    let checkHash: IHash = await cryptoHelpers.pwhash(pass, salt);
    let checkHashString: string = bintools.avaSerialize(checkHash.hash);

    if (checkHashString !== pass_hash) {
        throw "INVALID_PASS";
    }



    let keys: KeyFileKey[] = data.keys;
    let keysDecrypt: KeyFileKeyDecrypted[] = [];

    for (let i:number = 0; i < keys.length; i++) {
        let key_data: KeyFileKey = keys[i];

        let key: Buffer = bintools.avaDeserialize(key_data.key);
        let nonce: Buffer = bintools.avaDeserialize(key_data.nonce);
        let address: string = key_data.address;
        // let walletType: wallet_type = key_data.type || 'hd';

        let key_decrypt: Buffer = await cryptoHelpers.decrypt(pass,key,salt,nonce);
        let key_string: string = bintools.avaSerialize(key_decrypt);

        keysDecrypt.push({
            key: key_string,
            address: address
        });
    }

    return {
        version: version,
        keys: keysDecrypt
    }
}


// Given an array of wallets and a password, return an encrypted JSON object that is the keystore file
async function makeKeyfile(wallets: AvaHdWallet[], pass:string): Promise<KeyFile>{
    let salt: Buffer = await cryptoHelpers.makeSalt();
    let passHash: IHash = await cryptoHelpers.pwhash(pass, salt);

    let keys:KeyFileKey[] = [];

    for(let i:number=0; i<wallets.length;i++){
        let wallet: AvaHdWallet = wallets[i];
        let pk: Buffer = wallet.getMasterKey().getPrivateKey();
        let addr: string = wallet.getMasterKey().getAddressString();

        let pk_crypt: PKCrypt = await cryptoHelpers.encrypt(pass,pk,salt);

        let key_data: KeyFileKey = {
            key: bintools.avaSerialize(pk_crypt.ciphertext),
            nonce: bintools.avaSerialize(pk_crypt.nonce),
            address: addr,
        };
        keys.push(key_data);
    }

    let file_data: KeyFile = {
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
