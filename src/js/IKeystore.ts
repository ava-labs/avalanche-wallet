export type AllKeyFileTypes = KeyFile | KeyFileV6
export type AllKeyFileDecryptedTypes = KeyFileDecrypted | KeyFileDecryptedV6

export interface KeyFile {
    salt: string
    keys: KeyFileKey[]
    version: string
    // warnings: string[]
}

export interface KeyFileKey {
    key: string
    iv: string
}

export interface KeyFileDecrypted {
    version: string
    keys: KeyFileKeyDecrypted[]
}

export interface KeyFileKeyDecrypted {
    key: string
}

// V6 #################################

export type KeystoreFileKeyType = 'mnemonic' | 'singleton'

export interface KeyFileV6 {
    salt: string
    keys: KeyFileKeyV6[]
    version: string
}

export interface KeyFileKeyV6 {
    key: string
    iv: string
    type: KeystoreFileKeyType
}

export interface KeyFileDecryptedV6 {
    version: string
    keys: KeyFileKeyDecryptedV6[]
}

export interface KeyFileKeyDecryptedV6 {
    key: string
    type: KeystoreFileKeyType
}
