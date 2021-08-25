import CryptoJS from 'crypto-js/core'
import AES from 'crypto-js/aes'
const randomstring = require('randomstring')

export default class MnemonicPhrase {
    private pass: string
    private encrypted: any

    constructor(mnemonic: string) {
        this.pass = randomstring.generate(10)
        this.encrypted = AES.encrypt(mnemonic, this.pass).toString()
    }

    public getValue() {
        return AES.decrypt(this.encrypted, this.pass).toString(CryptoJS.enc.Utf8)
    }
}
