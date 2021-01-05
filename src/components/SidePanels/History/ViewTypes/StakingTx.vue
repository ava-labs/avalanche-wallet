<template>
    <div class="staking_tx">
        <div class="data_row" v-if="isRewarded">
            <p class="rewarded">
                <span><fa icon="check-square"></fa></span>
                {{ $t('transactions.rewarded') }}
            </p>
        </div>
        <div class="data_row" v-else-if="!isRewarded && !!rewardTime">
            <p class="not_rewarded">
                <span><fa icon="times"></fa></span>
                {{ $t('transactions.not_rewarded') }}
            </p>
        </div>
        <div class="data_row" v-else>Reward Pending</div>

        <div class="data_row">
            <p>{{ actionText }}</p>
            <p class="amt">{{ amtText }} AVAX</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'

@Component
export default class StakingTx extends Vue {
    @Prop() transaction!: ITransactionData

    get isValidator() {
        return this.transaction.type === 'add_validator'
    }

    get actionText() {
        if (this.isValidator) {
            return 'Add Validator'
        } else {
            return 'Add Delegator'
        }
    }

    get amt(): BN {
        let tot = this.transaction.outputs.reduce((acc, out) => {
            if (out.stake) {
                return acc.add(new BN(out.amount))
            }
            return acc
        }, new BN(0))
        return tot
    }

    get amtText() {
        let big = bnToBig(this.amt, 9)
        return big.toLocaleString()
    }

    get isRewarded() {
        return this.transaction.rewarded
    }

    get rewardTime() {
        return this.transaction.rewardedTime
    }
}
</script>
<style scoped lang="scss">
.data_row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--primary-color-light);
}

.amt {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
    color: var(--info);
}

.rewarded {
    span {
        margin-right: 6px;
        color: var(--success);
    }
}
.not_rewarded span {
    color: var(--error);
}
</style>
