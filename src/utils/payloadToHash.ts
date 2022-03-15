import * as CryptoJS from 'crypto-js/core'

/**
 * Used to generate ids from payloads in NFTs.
 * NOT USED for crypto purposes.
 * @param payload Payload contents as a string.
 */
export function payloadToHash(payload: string) {
    return CryptoJS.MD5(payload).toString()
}
