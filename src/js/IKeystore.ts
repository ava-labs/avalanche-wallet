export type KeystoreFileKeyType = 'mnemonic' | 'singleton'
export type AllKeyFileTypes = KeyFileV2 | KeyFileV3 | KeyFileV4 | KeyFileV5 | KeyFileV6
export type AllKeyFileDecryptedTypes =
    | KeyFileDecryptedV2
    | KeyFileDecryptedV3
    | KeyFileDecryptedV4
    | KeyFileDecryptedV5
    | KeyFileDecryptedV6

// V2 #################################
export interface KeyFileV2 {
    salt: string
    keys: KeyFileKeyV2[]
    pass_hash: string
    version: string
}

export interface KeyFileKeyV2 {
    key: string
    iv: string
    address: string
}

export interface KeyFileDecryptedV2 {
    version: string
    keys: KeyFileKeyDecryptedV2[]
    activeIndex: number
}

export interface KeyFileKeyDecryptedV2 {
    key: string
}

// V3 #################################
// Underlying encryption changed.
export interface KeyFileV3 {
    salt: string
    keys: KeyFileKeyV3[]
    pass_hash: string
    version: string
    warnings: string[]
}

export interface KeyFileKeyV3 {
    key: string
    iv: string
    address: string
}

export interface KeyFileDecryptedV3 {
    version: string
    keys: KeyFileKeyDecryptedV3[]
    activeIndex: number
}

export interface KeyFileKeyDecryptedV3 {
    key: string
}

// V4 #################################
// Avalanche uses bech32 addresses. Removed address field from keys and the warning message.
export interface KeyFileV4 {
    salt: string
    keys: KeyFileKeyV4[]
    pass_hash: string
    version: string
}

export interface KeyFileKeyV4 {
    key: string
    iv: string
}

export interface KeyFileDecryptedV4 {
    version: string
    keys: KeyFileKeyDecryptedV4[]
    activeIndex: number
}

export interface KeyFileKeyDecryptedV4 {
    key: string
}

// V5 #################################
// Encodes mnemonic phrase as the key.
export interface KeyFileV5 {
    salt: string
    keys: KeyFileKeyV5[]
    pass_hash: string
    version: string
}

export interface KeyFileKeyV5 {
    key: string
    iv: string
}

export interface KeyFileDecryptedV5 {
    version: string
    keys: KeyFileKeyDecryptedV5[]
    activeIndex: number
}

export interface KeyFileKeyDecryptedV5 {
    key: string
}

// V6 #################################
// Removes pass_hash. Adds activeIndex and a type (mnemonic | singleton) to key
export interface KeyFileV6 {
    salt: string
    keys: KeyFileKeyV6[]
    version: string
    activeIndex: number
}

export interface KeyFileKeyV6 {
    key: string
    iv: string
    type: KeystoreFileKeyType
}

export interface KeyFileDecryptedV6 {
    activeIndex: number
    version: string
    keys: KeyFileKeyDecryptedV6[]
}

export interface KeyFileKeyDecryptedV6 {
    key: string
    type: KeystoreFileKeyType
}
