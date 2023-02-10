import axios from 'axios'

const britannicaProvider = axios.create({
    baseURL: 'https://glacier-api.avax.network',
})

interface GetBalancesRequest {
    addresses: string[]
    blockchainId: string
    network: 'mainnet' | 'testnet'
}

/**
 * Get balances for a given set of addresses
 * @param config
 */
export async function getBalances(config: GetBalancesRequest) {
    const strippedAddrs = config.addresses.map((addr) => addr.split('-')[1] || addr)

    const url = `/v1/networks/${config.network}/blockchains/${
        config.blockchainId
    }/balances?addresses=${strippedAddrs.join(',')}`

    return britannicaProvider.get(url)
}
