const MNEMONIC =
    'warrior unfold world evoke toe luxury educate gadget guess dress silk humor pipe erupt case fragile vessel width letter walnut panther spring brisk two'

import { ava, avm, cChain, pChain } from '@/AVA'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
// import { avmGetAllUTXOs } from '@/helpers/utxo_helper'

ava.setNetworkID(5)
avm.setBlockchainAlias('X')
pChain.setBlockchainAlias('P')
cChain.setBlockchainAlias('C')

describe('Singleton Wallet', () => {
    const wallet = new AvaHdWallet(MNEMONIC)

    test('can init', () => {
        expect(wallet.mnemonic === MNEMONIC)
    })
})
