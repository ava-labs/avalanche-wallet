<template>
    <div class="staking_tx">
        <template v-if="isRewarded">
            <div class="data_row" v-if="!isDelegatorReward">
                <p class="rewarded">
                    <span><fa icon="check-square"></fa></span>
                    {{ $t('transactions.rewarded') }}
                </p>
            </div>

            <div class="data_row reward_row">
                <p>{{ $t('transactions.date_reward') }}</p>
                <p>
                    {{ endDate.toLocaleDateString() }}
                    {{ endDate.toLocaleTimeString() }}
                </p>
            </div>
            <div class="data_row reward_row">
                <p>{{ nativeAssetSymbol }} Price at reward date</p>
                <p v-if="rewardDateAvaxPrice">{{ rewardDateAvaxPrice.toFixed(2) }} USD</p>
                <p v-else>Unknown</p>
            </div>
            <div class="data_row reward_row">
                <p>Total reward in USD</p>
                <p v-if="totalRewardUSD">{{ totalRewardUSD.toLocaleString(2) }} USD</p>
                <p v-else>-</p>
            </div>
            <div class="data_row">
                <p v-if="!isDelegatorReward">{{ $t('transactions.reward_amount') }}</p>
                <p v-else>{{ $t('transactions.fee_amount') }}</p>
                <p class="amt">{{ rewardAmtText.toLocaleString() }} {{ nativeAssetSymbol }}</p>
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
                    <p class="amt">{{ rewardText }} {{ nativeAssetSymbol }}</p>
                </div>
            </template>
        </div>

        <div class="data_row" v-if="!isDelegatorReward">
            <p>{{ actionText }}</p>
            <p class="amt">{{ amtText }} {{ nativeAssetSymbol }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ITransactionData } from '@/store/modules/history/types'
import { BN } from '@c4tplatform/camino'
import { bnToBig } from '@/helpers/helper'
import { UnixNow } from '@c4tplatform/camino/dist/utils'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'
import { WalletType } from '@/js/wallets/types'
import { getPriceAtUnixTime } from '@/helpers/price_helper'
import Big from 'big.js'

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

    get isDelegatorReward() {
        if (this.isValidator) return false

        // If its a delegation, and the wallet does not own any of the inputs
        let ins = this.transaction.inputs || []
        let inUtxos = ins.map((input) => input.output)

        let inAddrs = []
        for (var i = 0; i < inUtxos.length; i++) {
            let utxo = inUtxos[i]
            inAddrs.push(...utxo.addresses)
        }

        let inWalletAddrs = inAddrs.filter((addr) => {
            return this.pAddrsClean.includes(addr)
        })

        return inWalletAddrs.length === 0
    }

    get actionText() {
        if (this.isValidator) {
            return 'Add Validator'
        } else {
            return 'Add Delegator'
        }
    }

    get stakeAmt(): BN {
        let tot = this.transaction.outputs.reduce((acc, out) => {
            if (out.stake) {
                return acc.add(new BN(out.amount))
            }
            return acc
        }, new BN(0))
        return tot
    }

    get wallet(): WalletType {
        return this.$store.state.activeWallet
    }

    get pAddrsClean(): string[] {
        let pAddrs = this.wallet.getAllAddressesP()
        return pAddrs.map((addr) => addr.split('-')[1])
    }

    // Reward received after a successful staking transaction
    get rewardAmt(): BN {
        if (!this.isRewarded) return new BN(0)

        let pAddrsClean = this.pAddrsClean

        let myRewardUTXOs = this.transaction.outputs.filter((utxo) => {
            let isReward = utxo.rewardUtxo
            let myReward = pAddrsClean.includes(utxo.addresses[0])
            return isReward && myReward
        })

        let tot = myRewardUTXOs.reduce((acc, out) => {
            return acc.add(new BN(out.amount))
        }, new BN(0))
        return tot
    }

    get rewardAmtBig(): Big {
        return bnToBig(this.rewardAmt, 9)
    }

    get rewardDateAvaxPrice(): number | undefined {
        if (!this.endDate) return undefined
        let unixTime = this.endDate.getTime()
        let price = getPriceAtUnixTime(unixTime)
        return price
    }

    get totalRewardUSD(): Big | undefined {
        if (!this.rewardDateAvaxPrice) return undefined
        return this.rewardAmtBig.times(this.rewardDateAvaxPrice)
    }

    get rewardAmtText() {
        return bnToBig(this.rewardAmt, 9)
    }

    get amtText() {
        let big = bnToBig(this.stakeAmt, 9)
        return big.toLocaleString()
    }

    get isRewarded() {
        return this.transaction.rewarded
    }

    // DO NOT use this as the date reward received. Use validator end time instead.
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

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
.data_row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    column-gap: 1em;
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
