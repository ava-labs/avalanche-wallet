import {
    GetBalancesParams,
    ListStakingParams,
    ListStakingResponse,
    ListStakingTx,
} from '@/js/Glacier/models'
import { BN } from 'avalanche'
import GlacierService from '@/js/Glacier/GlacierService'
import { ava, pChain } from '@/AVA'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'

export function cleanAddrs(addresses: string[]) {
    return addresses.map((addr) => addr.split('-')[1] || addr)
}

export function splitToParts<ArrayType>(array: ArrayType[], size: number) {
    if (!size) return [array]
    const parts = []
    const copy = [...array]
    while (copy.length) {
        parts.push(copy.splice(0, size))
    }
    return parts
}

export async function getBalancesForAddresses(config: GetBalancesParams) {
    // Max number of addresses glacier accepts
    const addressLimit = 64
    const addressBuckets = splitToParts<string>(config.addresses, addressLimit)

    const promises = addressBuckets.map((bucketAddrs) => {
        return GlacierService.getBalances({ ...config, addresses: bucketAddrs })
    })

    const res = await Promise.all(promises)

    const unlockedUnstaked = new BN(0)
    const lockedUnstaked = new BN(0)
    const unlockedStaked = new BN(0)
    const lockedStaked = new BN(0)

    res.forEach((val) => {
        unlockedUnstaked.iadd(
            new BN(val.balances.unlockedUnstaked ? val.balances.unlockedUnstaked[0].amount : 0)
        )

        lockedUnstaked.iadd(
            new BN(val.balances.lockedUnstaked ? val.balances.lockedUnstaked[0].amount : 0)
        )

        unlockedStaked.iadd(
            new BN(val.balances.unlockedStaked ? val.balances.unlockedStaked[0].amount : 0)
        )

        lockedStaked.iadd(
            new BN(val.balances.lockedStaked ? val.balances.lockedStaked[0].amount : 0)
        )
    })

    return {
        unlockedUnstaked,
        unlockedStaked,
        lockedUnstaked,
        lockedStaked,
    }
}

export async function listStakingForAddresses(addrs: string[]) {
    if (!addrs.length) return []

    const chainID = pChain.getBlockchainID()
    const netID = ava.getNetworkID()

    const network = isMainnetNetworkID(netID) ? 'mainnet' : 'fuji'

    // Cannot use glacier for other networks
    if (!isTestnetNetworkID(netID)) return []

    const addressLimit = 64
    const addrParts = splitToParts<string>(addrs, addressLimit)

    async function fetchAll(config: ListStakingParams): Promise<ListStakingTx[]> {
        const res = await GlacierService.listStaking(config)
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
            sortOrder: 'desc',
            blockchainId: chainID,
            network,
        })
    })

    const results = (await Promise.all(promises)).flat()

    const ids: string[] = []
    return results.filter((tx) => {
        if (ids.includes(tx.txHash)) return false
        ids.push(tx.txHash)
        return true
    })
}
