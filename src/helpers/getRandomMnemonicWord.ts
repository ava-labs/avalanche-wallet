import { generateMnemonic } from 'bip39'

/**
 * Returns a random word from a new mnemonic phrase.
 */
export function getRandomMnemonicWord() {
    const words = generateMnemonic(256).split(' ')
    const rand = Math.floor(Math.random() * words.length)
    return words[rand]
}
