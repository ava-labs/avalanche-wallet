import { ava } from '@/AVA'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { ListStakingParams } from '@/js/Glacier/models'
import { splitToParts } from '@/js/Glacier/utils'
import { filterDuplicateGlacierTxs } from './filterDuplicateGlacierTxs'
import Glacier from './Glacier'
import { Network, PChainId, PChainTransaction, SortOrder } from '@avalabs/glacier-sdk'

export async function listStakingForAddresses(addrs: string[]) {
    if (!addrs.length) return []

    const netID = ava.getNetworkID()

    const network = isMainnetNetworkID(netID) ? Network.MAINNET : Network.FUJI

    // Cannot use glacier for other networks
    if (!isMainnetNetworkID(netID) && !isTestnetNetworkID(netID)) return []

    const addressLimit = 64
    const addrParts = splitToParts<string>(addrs, addressLimit)

    async function fetchAll(config: ListStakingParams): Promise<PChainTransaction[]> {
        // const res = await GlacierService.listStaking(config)
        const res = await Glacier.primaryNetwork.listActivePrimaryNetworkStakingTransactions({
            ...config,
            addresses: config.addresses.join(','),
        })

        if (res.nextPageToken) {
            const next = await fetchAll({
                ...config,
                pageToken: res.nextPageToken,
            })
            return [...res.transactions, ...next]
        }
        return res.transactions ?? []
    }

    const promises = addrParts.map((addrs) => {
        return fetchAll({
            addresses: addrs,
            pageSize: 100,
            sortOrder: SortOrder.DESC,
            blockchainId: PChainId.P_CHAIN,
            network,
        })
    })

    const results = (await Promise.all(promises)).flat()

    return filterDuplicateGlacierTxs(results) as PChainTransaction[]
}
