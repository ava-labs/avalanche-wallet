import {wallet_type} from "@/js/IAvaHdWallet";

export interface KeyFile{
    salt: string,
    pass_hash: string,
    keys: KeyFileKey[],
    version: string
}

export interface KeyFileKey {
    key: string,
    nonce: string,
    address: string
    type: wallet_type
}



export interface KeyFileDecrypted {
    version: string,
    keys: KeyFileKeyDecrypted[]
}

export interface KeyFileKeyDecrypted {
    key: string
    address: string,
    type: wallet_type
}
