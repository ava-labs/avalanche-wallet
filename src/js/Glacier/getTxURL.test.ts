import { getTxURL } from '@/js/Glacier/getTxURL'

describe('getTxURL', () => {
    it('can get mainnet url for X Chain', () => {
        const url = getTxURL('hash1', 'X', true)
        expect(url).toEqual('https://subnets.avax.network/x-chain/tx/hash1')
    })

    it('can get mainnet url for P Chain', () => {
        const url = getTxURL('hash1', 'P', true)
        expect(url).toEqual('https://subnets.avax.network/p-chain/tx/hash1')
    })

    it('can get mainnet url for C Chain', () => {
        const url = getTxURL('hash1', 'C', true)
        expect(url).toEqual('https://avascan.info/blockchain/c/tx/hash1')
    })

    it('can get testnet url for X Chain', () => {
        const url = getTxURL('hash1', 'X', false)
        expect(url).toEqual('https://subnets-test.avax.network/x-chain/tx/hash1')
    })
})
