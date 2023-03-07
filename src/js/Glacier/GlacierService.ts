import axios from 'axios'
import {
    GetBalancesParams,
    GetBalancesResponse,
    ListStakingParams,
    ListStakingResponse,
} from '@/js/Glacier/models'
import { cleanAddrs } from './utils'

class GlacierService {
    private provider = axios.create({
        baseURL: 'https://glacier-api.avax.network',
    })

    static getBaseURL(network: string, blockchainID: string) {
        return `/v1/networks/${network}/blockchains/${blockchainID}`
    }

    /**
     * Get balances for a given set of addresses
     * @param config
     */
    async getBalances(config: GetBalancesParams) {
        const addrs = cleanAddrs(config.addresses)
        const url =
            GlacierService.getBaseURL(config.network, config.blockchainId) +
            `/balances?addresses=${addrs.join(',')}`

        return (await this.provider.get<GetBalancesResponse>(url)).data
    }

    async listStaking(config: ListStakingParams) {
        const addrs = cleanAddrs(config.addresses)

        const params = new URLSearchParams()
        params.append('addresses', addrs.join(','))
        params.append('pageSize', config.pageSize.toString())
        params.append('sortOrder', config.sortOrder)
        config.pageToken && params.append('pageToken', config.pageToken)
        const url =
            GlacierService.getBaseURL(config.network, config.blockchainId) +
            `/transactions:listStaking?` +
            params.toString()

        return (await this.provider.get<ListStakingResponse>(url)).data
    }
}

export default new GlacierService()
