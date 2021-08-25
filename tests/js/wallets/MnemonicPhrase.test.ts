import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'

const PHRASE =
    'uncover sight giant angry loud enter heavy receive whip crisp luggage monkey bracket wide diary blanket food gown rail sudden scissors crop afford snake'

describe('MnemonicPhrase', () => {
    it('can encrypt and decrypt', () => {
        let phrase = new MnemonicPhrase(PHRASE)
        expect(phrase.getValue()).toEqual(PHRASE)
    })
})
