import { ValidatorListFilter } from '@/components/wallet/earn/Delegate/types'
import { ValidatorListItem } from '@/store/modules/platform/types'
import { DAY_MS } from '@/constants'
import { ONEAVAX } from '@c4tplatform/camino/dist/utils'
import { BN } from '@c4tplatform/camino'

function filterValidatorList(
    list: ValidatorListItem[],
    filter: ValidatorListFilter | null
): ValidatorListItem[] {
    let now = Date.now()
    if (!filter) return list

    let minDurationMs = filter.minDuration * DAY_MS
    let res = list.filter((val: ValidatorListItem) => {
        // Filter by remaining stake amount
        let minSpace = ONEAVAX.mul(new BN(filter.availableSpace))
        if (val.remainingStake.lt(minSpace)) {
            return false
        }

        // Filter by time
        let endTime = val.endTime
        if (endTime.getTime() - now < minDurationMs) {
            return false
        }

        // Filter by fee
        if (val.fee > filter.maxFee) {
            return false
        }

        // Filter by uptime
        if (val.uptime < filter.minUptime / 100) {
            return false
        }

        return true
    })
    return res
}

export { filterValidatorList }
