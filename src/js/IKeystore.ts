export interface KeyFile {
    salt: string
    pass_hash: string
    keys: KeyFileKey[]
    version: string
    // warnings: string[]
}

export interface KeyFileKey {
    key: string
    iv: string
    // address: string
}

export interface KeyFileDecrypted {
    version: string
    keys: KeyFileKeyDecrypted[]
}

export interface KeyFileKeyDecrypted {
    key: string
    // address: string,
}
