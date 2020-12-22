// Functions to manage import/export of keystore files
import { KeyFile, KeyFileDecrypted, KeyFileKey, KeyFileKeyDecrypted } from './IKeystore'
import { bintools } from '@/AVA'
import { Buffer } from 'buffer/'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import Crypto from '@/js/Crypto'

const cryptoHelpers = new Crypto()

const KEYSTORE_VERSION: string = '5.0'

const ITERATIONS_V2 = 100000
const ITERATIONS_V3 = 200000 // and any version above

const SUPPORTED_VERSION = ['2.0', '3.0', '4.0', '5.0']

interface IHash {
    salt: Buffer
    hash: Buffer
}

interface PKCrypt {
    salt: Buffer
    iv: Buffer
    ciphertext: Buffer
}

async function readKeyFile(data: KeyFile, pass: string): Promise<KeyFileDecrypted> {
    const version: string = data.version

    if (!SUPPORTED_VERSION.includes(version)) {
        throw 'INVALID_VERSION'
    }

    if (version === '2.0') {
        cryptoHelpers.keygenIterations = ITERATIONS_V2
    } else {
        cryptoHelpers.keygenIterations = ITERATIONS_V3
    }

    let salt: Buffer = bintools.cb58Decode(data.salt)
    let pass_hash: string = data.pass_hash

    let checkHashString: string
    if (version === '2.0') {
        let checkHash: Buffer = await cryptoHelpers._pwcleaner(pass, salt)
        checkHashString = bintools.cb58Encode(checkHash)
    } else {
        let checkHash: IHash = await cryptoHelpers.pwhash(pass, salt)
        checkHashString = bintools.cb58Encode(checkHash.hash)
    }

    if (checkHashString !== pass_hash) {
        throw 'INVALID_PASS'
    }

    let keys: KeyFileKey[] = data.keys
    let keysDecrypt: KeyFileKeyDecrypted[] = []

    for (let i: number = 0; i < keys.length; i++) {
        let key_data: KeyFileKey = keys[i]

        let key: Buffer = bintools.cb58Decode(key_data.key)
        let nonce: Buffer = bintools.cb58Decode(key_data.iv)

        let key_decrypt: Buffer = await cryptoHelpers.decrypt(pass, key, salt, nonce)
        let key_string: string

        //  versions below 5.0 used private key that had to be cb58 encoded
        if (['2.0', '3.0', '4.0'].includes(version)) {
            key_string = bintools.cb58Encode(key_decrypt)
        } else {
            key_string = key_decrypt.toString()
        }

        keysDecrypt.push({
            key: key_string,
        })
    }

    return {
        version: version,
        keys: keysDecrypt,
    }
}

// Given an array of wallets and a password, return an encrypted JSON object that is the keystore file
async function makeKeyfile(wallets: AvaHdWallet[], pass: string): Promise<KeyFile> {
    // 3.0 uses 200,000
    cryptoHelpers.keygenIterations = ITERATIONS_V3

    let salt: Buffer = await cryptoHelpers.makeSalt()
    let passHash: IHash = await cryptoHelpers.pwhash(pass, salt)

    let keys: KeyFileKey[] = []

    for (let i: number = 0; i < wallets.length; i++) {
        let wallet: AvaHdWallet = wallets[i]
        let mnemonic = wallet.mnemonic
        let pk_crypt: PKCrypt = await cryptoHelpers.encrypt(pass, mnemonic, salt)

        let key_data: KeyFileKey = {
            key: bintools.cb58Encode(pk_crypt.ciphertext),
            iv: bintools.cb58Encode(pk_crypt.iv),
        }
        keys.push(key_data)
    }

    let file_data: KeyFile = {
        version: KEYSTORE_VERSION,
        salt: bintools.cb58Encode(salt),
        pass_hash: bintools.cb58Encode(passHash.hash),
        keys: keys,
    }
    return file_data
}

export { readKeyFile, makeKeyfile, KEYSTORE_VERSION }
