<template>
    <div class="staking_tx">
        <template v-if="isRewarded">
            <div class="data_row">
                <p class="rewarded">
                    <span><fa icon="check-square"></fa></span>
                    {{ $t('transactions.rewarded') }}
                </p>
            </div>
            <div class="data_row reward_row">
                <p>{{ $t('transactions.end') }}</p>
                <p>
                    {{ endDate.toLocaleDateString() }}
                    {{ endDate.toLocaleTimeString() }}
                </p>
            </div>
        </template>
        <template v-else-if="!isRewarded && !!rewardTime">
            <div class="data_row">
                <p class="not_rewarded">
                    <span><fa icon="times"></fa></span>
                    {{ $t('transactions.not_rewarded') }}
                </p>
            </div>
            <div class="data_row reward_row">
                <p>{{ $t('transactions.end') }}</p>
                <p>
                    {{ endDate.toLocaleDateString() }}
                    {{ endDate.toLocaleTimeString() }}
                </p>
            </div>
        </template>
        <div v-else>
            <div class="time_bar" v-if="isStarted">
                <div
                    class="bar_row"
                    :style="{
                        width: `${timeBarPerc}%`,
                    }"
                ></div>
            </div>
            <div v-if="!isStarted" class="data_row date_row">
                <p>{{ $t('transactions.start') }}</p>
                <p>
                    {{ startDate.toLocaleDateString() }}
                    {{ startDate.toLocaleTimeString() }}
                </p>
            </div>
            <template v-else>
                <div class="data_row reward_row">
                    <p>{{ $t('transactions.end') }}</p>
                    <p>
                        {{ endDate.toLocaleDateString() }}
                        {{ endDate.toLocaleTimeString() }}
                    </p>
                </div>
                <div class="data_row reward_row">
                    <p>{{ $t('transactions.reward_pending') }}</p>
                    <p class="amt">{{ rewardText }} AVAX</p>
                </div>
            </template>
        </div>

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
import { UnixNow } from 'avalanche/dist/utils'
import { ValidatorListItem } from '@/store/modules/platform/types'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'
import moment from 'moment'

@Component
export default class StakingTx extends Vue {
    @Prop() transaction!: ITransactionData
    isStarted = false
    mounted() {
        this.updateStartStatus()
    }

    updateStartStatus() {
        let now = UnixNow()
        this.isStarted = now.toNumber() > this.startTime

        if (!this.isStarted) {
            setTimeout(() => {
                this.updateStartStatus()
            }, 5000)
        }
    }

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

    get startTime() {
        return this.transaction.validatorStart
    }
    get endtime() {
        return this.transaction.validatorEnd
    }

    get startDate() {
        return new Date(this.startTime * 1000)
    }

    get endDate() {
        return new Date(this.endtime * 1000)
    }
    get validator(): ValidatorRaw | null {
        let nodeId = this.transaction.validatorNodeID
        if (nodeId) {
            for (var i = 0; i < this.validators.length; i++) {
                let v = this.validators[i]
                let nodeIdRaw = v.nodeID.split('-')[1]
                if (nodeIdRaw === nodeId) {
                    return v
                }
            }
        }
        return null
    }

    get potentialReward() {
        let v = this.validator
        if (v) {
            if (this.isValidator) {
                return v.potentialReward
            } else {
                let delegators = v.delegators
                if (!delegators) return null
                for (var i = 0; i < delegators.length; i++) {
                    let d = delegators[i]
                    if (d.txID === this.transaction.id) {
                        return d.potentialReward
                    }
                }
            }
        }
        return null
    }

    get rewardBig() {
        let reward = this.potentialReward
        if (!reward) return null

        let bn = new BN(reward)
        return bnToBig(bn, 9)
    }

    get rewardText() {
        if (!this.rewardBig) return '?'
        return this.rewardBig.toLocaleString()
    }

    get validators(): ValidatorRaw[] {
        return this.$store.state.Platform.validators
    }

    get timeBarPerc() {
        if (!this.isStarted) return 0
        let now = UnixNow()
        // if (this.endtime) {
        let dur = this.endtime - this.startTime
        return ((now.toNumber() - this.startTime) / dur) * 100
        // }
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

.bar_row {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 24px;
}
.amt {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
    color: var(--info);
}

.time_bar {
    background-color: var(--bg-wallet);
    border-radius: 8px;
    height: 4px;
    margin: 4px 0;
    width: 100%;
    overflow: hidden;
    position: relative;
    align-self: center;

    > div {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background-color: rgba(var(--info-1), 0.6);
    }

    p {
        width: 100%;
        text-align: center;
        position: relative;
        z-index: 2;
        font-size: 12px;
        line-height: 14px;
        color: var(--primary-color);
    }
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
