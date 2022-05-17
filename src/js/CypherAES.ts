import CryptoJS from 'crypto-js/core'
import AES from 'crypto-js/aes'
import randomstring from 'randomstring'

/**
 * A helper class to obfuscate strings when storing in memory. Used as a helper rather than secure encryption.
 * @Remarks Do NOT use this class for actual secure encryption needs.
 */
export class CypherAES {
    private pass: string
    private encrypted: string

    constructor(value: string) {
        this.pass = randomstring.generate(32)
        this.encrypted = AES.encrypt(value, this.pass).toString()
    }

    public getValue() {
        return AES.decrypt(this.encrypted, this.pass).toString(CryptoJS.enc.Utf8)
    }
}
