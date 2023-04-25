import { GetBalancesParams } from '@/js/Glacier/models'
import Glacier from '@/js/Glacier/Glacier'
import { BN } from 'avalanche'
import { splitToParts } from '@/js/Glacier/utils'
import {
    ListPChainBalancesResponse,
    ListXChainBalancesResponse,
    ListCChainAtomicBalancesResponse,
} from '@avalabs/glacier-sdk'

export async function getBalancesForAddresses(config: GetBalancesParams) {
    // Max number of addresses glacier accepts
    const addressLimit = 64
    const addressBuckets = splitToParts<string>(config.addresses, addressLimit)

    const promises = addressBuckets.map((bucketAddrs) => {
        return Glacier.primaryNetwork.getBalancesByAddresses({
            ...config,
            addresses: bucketAddrs.join(','),
        })
        // return GlacierService.getBalances({ ...config, addresses: bucketAddrs })
    })

    const res = await Promise.all(promises)

    const unlockedUnstaked = new BN(0)
    const lockedUnstaked = new BN(0)
    const unlockedStaked = new BN(0)
    const lockedStaked = new BN(0)

    function isPChainBalancesResponse(
        val:
            | ListPChainBalancesResponse
            | ListXChainBalancesResponse
            | ListCChainAtomicBalancesResponse
    ): val is ListPChainBalancesResponse {
        return typeof val === 'object' && val !== null && !Array.isArray(val)
    }

    // ONLY SUPPORTS P CHAIN AT THE MOMENT
    res.forEach((val) => {
        if (isPChainBalancesResponse(val)) {
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
        }
    })

    return {
        unlockedUnstaked,
        unlockedStaked,
        lockedUnstaked,
        lockedStaked,
    }
}
