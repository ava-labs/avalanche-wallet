import { expect } from '@jest/globals';
import { SingletonWallet } from '@/js/wallets/SingletonWallet'

const TEST_KEY = 'PrivateKey-r6yxM4MiGc93hZ4QxSHhixLEH5RtPjGw6Y85gzg8mgaia6HT3'
const ADDR_X = 'X-local1np2h3agqvgxc29sqfh0dy2nvmedus0saq50js5'
const ADDR_C = '506433b9338e2a5706e3c0d6bce041d30688935f'

import { ava } from '@/AVA'
// import { avmGetAllUTXOs } from '@/helpers/utxo_helper'
// ava.setNetwork('127.0.0.1',80,'http',12345)
// jest.mock('avmGetAllUTXOs')

describe('Singleton Wallet', () => {
    const wallet = new SingletonWallet(TEST_KEY)

    test('can init', () => {
        expect(wallet.key === TEST_KEY)
    })

    test('getCurrentAddressAvm', () => {
        let addrX = wallet.getCurrentAddressAvm()
        expect(addrX).toEqual(ADDR_X)
    })

    test('evm address correct', () => {
        let addrC = wallet.getEvmAddress()
        expect(addrC).toEqual(ADDR_C)
    })

    // test('update utxos', () => {
    //     avmGetAllUTXOs.mockResolvedValue
    // })
})
