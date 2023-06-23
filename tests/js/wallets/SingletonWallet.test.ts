import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import { isValidChecksumAddress } from 'ethereumjs-util'
const TEST_KEY = 'PrivateKey-r6yxM4MiGc93hZ4QxSHhixLEH5RtPjGw6Y85gzg8mgaia6HT3'
const ADDR_X = 'X-fuji1np2h3agqvgxc29sqfh0dy2nvmedus0sa44ktlr'
const ADDR_C = '506433b9338e2a5706e3c0d6bce041d30688935f'

import { ava, avm, cChain, pChain } from '@/AVA'

ava.setNetworkID(5)
avm.setBlockchainAlias('X')
pChain.setBlockchainAlias('P')
cChain.setBlockchainAlias('C')

describe('Singleton Wallet', () => {
    const wallet = new SingletonWallet(TEST_KEY)

    test('can init', () => {
        expect(wallet.key === TEST_KEY)
    })

    test('correct address', () => {
        let addrX = wallet.getCurrentAddressAvm() === ADDR_X
        let addrC = wallet.getEvmAddress() === ADDR_C
        expect(addrX && addrC).toEqual(true)
    })

    test('getCurrentAddressAvm', () => {
        let addr1 = wallet.getCurrentAddressAvm()
        expect(addr1).toEqual(ADDR_X)
    })

    test('evm address correct', () => {
        let addr1 = wallet.getEvmAddress()
        expect(addr1).toEqual(ADDR_C)
    })

    test('can get checksum address', () => {
        const address = wallet.getEvmChecksumAddress()
        expect(address).toEqual('0x506433b9338e2a5706E3c0D6BCe041D30688935f')
        expect(isValidChecksumAddress(address)).toBe(true)
    })
})
