// Functions to manage import/export of keystore files
import {
    AllKeyFileDecryptedTypes,
    AllKeyFileTypes,
    KeyFile,
    KeyFileDecrypted,
    KeyFileDecryptedV6,
    KeyFileKey,
    KeyFileKeyDecrypted,
    KeyFileKeyDecryptedV6,
    KeyFileKeyV6,
    KeyFileV6,
    KeystoreFileKeyType,
} from './IKeystore'
import { avm, bintools } from '@/AVA'
import { Buffer } from 'buffer/'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import Crypto from '@/js/Crypto'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import { AccessWalletMultipleInput } from '@/store/types'
import { keyToKeypair } from '@/helpers/helper'
import * as bip39 from 'bip39'

const cryptoHelpers = new Crypto()

const KEYSTORE_VERSION: string = '6.0'

const ITERATIONS_V2 = 100000
const ITERATIONS_V3 = 200000 // and any version above

const SUPPORTED_VERSION = ['2.0', '3.0', '4.0', '5.0', '6.0']

interface IHash {
    salt: Buffer
    hash: Buffer
}

interface PKCrypt {
    salt: Buffer
    iv: Buffer
    ciphertext: Buffer
}

async function readV2(data: KeyFile, pass: string) {}
async function readV3(data: KeyFile, pass: string) {}
async function readV4(data: KeyFile, pass: string) {}

// Extract old version support out and onto other functions
async function readV5(data: KeyFile, pass: string) {
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
    //@ts-ignore
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

async function readV6(data: KeyFileV6, pass: string): Promise<KeyFileDecryptedV6> {
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

    let checkHashString: string
    if (version === '2.0') {
        let checkHash: Buffer = await cryptoHelpers._pwcleaner(pass, salt)
        checkHashString = bintools.cb58Encode(checkHash)
    } else {
        let checkHash: IHash = await cryptoHelpers.pwhash(pass, salt)
        checkHashString = bintools.cb58Encode(checkHash.hash)
    }

    let keys: KeyFileKeyV6[] = data.keys
    let keysDecrypt: KeyFileKeyDecryptedV6[] = []

    for (let i: number = 0; i < keys.length; i++) {
        let key_data: KeyFileKeyV6 = keys[i]

        let key: Buffer = bintools.cb58Decode(key_data.key)
        let type: KeystoreFileKeyType = key_data.type
        let nonce: Buffer = bintools.cb58Decode(key_data.iv)
        let key_decrypt: Buffer

        try {
            key_decrypt = await cryptoHelpers.decrypt(pass, key, salt, nonce)
        } catch (e) {
            throw 'INVALID_PASS'
        }
        let key_string: string

        //  versions below 5.0 used private key that had to be cb58 encoded
        if (['2.0', '3.0', '4.0'].includes(version)) {
            key_string = bintools.cb58Encode(key_decrypt)
        } else {
            key_string = key_decrypt.toString()
        }

        keysDecrypt.push({
            key: key_string,
            type: type,
        })
    }

    return {
        version: version,
        keys: keysDecrypt,
    }
}

async function readKeyFile(data: AllKeyFileTypes, pass: string): Promise<AllKeyFileDecryptedTypes> {
    const version: string = data.version

    if (!SUPPORTED_VERSION.includes(version)) {
        throw 'INVALID_VERSION'
    }

    // TODO: Add switch statement for versions and call the correct read functions
    switch (version) {
        case '6.0':
            return await readV6(data as KeyFileV6, pass)
            break
        // TODO: Break up for version types
        default:
            return await readV5(data as KeyFile, pass)
            break
    }

    // if (version === '2.0') {
    //     cryptoHelpers.keygenIterations = ITERATIONS_V2
    // } else {
    //     cryptoHelpers.keygenIterations = ITERATIONS_V3
    // }
    //
    // let salt: Buffer = bintools.cb58Decode(data.salt)
    //
    // let checkHashString: string
    // if (version === '2.0') {
    //     let checkHash: Buffer = await cryptoHelpers._pwcleaner(pass, salt)
    //     checkHashString = bintools.cb58Encode(checkHash)
    // } else {
    //     let checkHash: IHash = await cryptoHelpers.pwhash(pass, salt)
    //     checkHashString = bintools.cb58Encode(checkHash.hash)
    // }
    //
    // let keys: KeyFileKey[] = data.keys
    // let keysDecrypt: KeyFileKeyDecrypted[] = []
    //
    // for (let i: number = 0; i < keys.length; i++) {
    //     let key_data: KeyFileKey = keys[i]
    //
    //     let key: Buffer = bintools.cb58Decode(key_data.key)
    //     let nonce: Buffer = bintools.cb58Decode(key_data.iv)
    //     let key_decrypt: Buffer
    //
    //     try {
    //         key_decrypt = await cryptoHelpers.decrypt(pass, key, salt, nonce)
    //     } catch (e) {
    //         throw 'INVALID_PASS'
    //     }
    //     let key_string: string
    //
    //     //  versions below 5.0 used private key that had to be cb58 encoded
    //     if (['2.0', '3.0', '4.0'].includes(version)) {
    //         key_string = bintools.cb58Encode(key_decrypt)
    //     } else {
    //         key_string = key_decrypt.toString()
    //     }
    //
    //     keysDecrypt.push({
    //         key: key_string,
    //     })
    // }
    //
    // return {
    //     version: version,
    //     keys: keysDecrypt,
    // }
}

// Given an array of wallets and a password, return an encrypted JSON object that is the keystore file
async function makeKeyfile(
    wallets: (AvaHdWallet | SingletonWallet)[],
    pass: string
): Promise<KeyFileV6> {
    // 3.0 and above uses 200,000
    cryptoHelpers.keygenIterations = ITERATIONS_V3

    let salt: Buffer = await cryptoHelpers.makeSalt()

    let keys: KeyFileKeyV6[] = []

    for (let i: number = 0; i < wallets.length; i++) {
        let wallet = wallets[i]
        let key
        let type: KeystoreFileKeyType
        if (wallet.type === 'singleton') {
            key = (wallet as SingletonWallet).key
            type = 'singleton'
        } else {
            key = (wallet as AvaHdWallet).mnemonic
            type = 'mnemonic'
        }
        let pk_crypt: PKCrypt = await cryptoHelpers.encrypt(pass, key, salt)

        let key_data: KeyFileKeyV6 = {
            key: bintools.cb58Encode(pk_crypt.ciphertext),
            iv: bintools.cb58Encode(pk_crypt.iv),
            type: type,
        }
        keys.push(key_data)
    }

    let file_data: KeyFileV6 = {
        version: KEYSTORE_VERSION,
        salt: bintools.cb58Encode(salt),
        keys: keys,
    }
    return file_data
}

function extractKeysFromDecryptedFile(file: AllKeyFileDecryptedTypes): AccessWalletMultipleInput[] {
    let chainID = avm.getBlockchainAlias()

    let accessInput: AccessWalletMultipleInput[]
    let type: KeystoreFileKeyType = 'mnemonic'
    let version = file.version

    // Convert old version private keys to mnemonic phrases
    if (['2.0', '3.0', '4.0'].includes(version)) {
        let keys = (file as KeyFileDecrypted).keys

        accessInput = keys.map((key) => {
            // Private keys from the keystore file do not have the PrivateKey- prefix
            let pk = 'PrivateKey-' + key.key
            let keypair = keyToKeypair(pk, chainID)

            let keyBuf = keypair.getPrivateKey()
            let keyHex: string = keyBuf.toString('hex')
            let paddedKeyHex = keyHex.padStart(64, '0')
            let mnemonic: string = bip39.entropyToMnemonic(paddedKeyHex)

            return {
                key: mnemonic,
                type: 'mnemonic',
            }
        })
    } else if (version === '5.0') {
        let keys = (file as KeyFileDecrypted).keys
        // New versions encrypt the mnemonic so we dont have to do anything
        accessInput = keys.map((key) => {
            return {
                key: key.key,
                type: 'mnemonic',
            }
        })
    } else {
        let keys = (file as KeyFileDecryptedV6).keys
        accessInput = keys.map((key) => {
            return {
                type: key.type,
                key: key.key,
            }
        })
    }
    return accessInput
}

export { readKeyFile, makeKeyfile, KEYSTORE_VERSION, extractKeysFromDecryptedFile }
