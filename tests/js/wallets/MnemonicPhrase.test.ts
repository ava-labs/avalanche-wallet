import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'
import * as bip39 from 'bip39'

describe('MnemonicPhrase', () => {
    it('can encrypt and decrypt', () => {
        const NUM_ITERATION = 10000
        for (var i = 0; i < NUM_ITERATION; i++) {
            let phraseRaw = bip39.generateMnemonic(256)
            let phrase = new MnemonicPhrase(phraseRaw)
            expect(phrase.getValue()).toEqual(phraseRaw)
        }
    })
})
