<template>
    <div class="staking_tx">
        <div class="data_row">
            <p>{{ actionText }}</p>
            <p class="amt">{{ amtText }} AVAX</p>
        </div>
        <!--If received validator reward and validator tx-->
        <div class="data_row" v-if="isValidator && receivedValidatorReward">
            <p>
                <span class="rewarded"><fa icon="check-square"></fa></span>
                {{ $t('transactions.reward_amount') }}
            </p>
            <p class="amt">{{ formatRewardAmount(validatorRewardAmount) }} AVAX</p>
        </div>
        <!--If received validator reward and delegator tx-->
        <div class="data_row" v-if="!isValidator && receivedValidatorReward">
            <p>
                <span class="rewarded"><fa icon="check-square"></fa></span>
                {{ $t('transactions.fee_amount') }}
            </p>
            <p class="amt">{{ formatRewardAmount(validatorRewardAmount) }} AVAX</p>
        </div>
        <!--If received delegator reward and delegator tx-->
        <div class="data_row" v-if="!isValidator && receivedDelegatorReward">
            <p>
                <span class="rewarded"><fa icon="check-square"></fa></span>
                {{ $t('transactions.reward_amount') }}
            </p>
            <p class="amt">{{ formatRewardAmount(delegatorRewardAmount) }} AVAX</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'
import { UnixNow } from 'avalanche/dist/utils'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'
import { WalletType } from '@/js/wallets/types'
import { getPriceAtUnixTime } from '@/helpers/price_helper'
import Big from 'big.js'
import { PChainTransaction, PChainUtxo, RewardType } from '@avalabs/glacier-sdk'
import { filterOwnedAddresses } from './filterOwnedAddresses'

@Component
export default class StakingTx extends Vue {
    @Prop() transaction!: PChainTransaction
    isStarted = false

    get isValidator() {
        return this.transaction.txType === 'AddValidatorTx'
    }

    get actionText() {
        if (this.isValidator) {
            return 'Add Validator'
        } else {
            return 'Add Delegator'
        }
    }

    get stakeAmt(): BN {
        let tot = (this.transaction.emittedUtxos ?? []).reduce((acc, out) => {
            return out.staked ? acc.add(new BN(out.amount)) : acc
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

    formatRewardAmount(amount: BN) {
        return bnToBig(amount, 9)
    }

    get amtText() {
        let big = bnToBig(this.stakeAmt, 9)
        return big.toLocaleString()
    }

    /**
     * The validator reward UTXO of this tx
     */
    get validatorReward(): PChainUtxo | undefined {
        return (this.transaction.emittedUtxos || []).filter((utxo) => {
            return utxo.rewardType === RewardType.VALIDATOR
        })[0]
    }

    /**
     * The delegator reward UTXO of this tx
     */
    get delegatorReward(): PChainUtxo | undefined {
        return (this.transaction.emittedUtxos || []).filter((utxo) => {
            return utxo.rewardType === RewardType.DELEGATOR
        })[0]
    }

    get validatorRewardAmount() {
        return this.validatorReward?.amount
    }

    get delegatorRewardAmount() {
        return this.validatorReward?.amount
    }

    /**
     * Returns true if this wallet received delegator reward
     */
    get receivedDelegatorReward() {
        if (this.isValidator || !this.delegatorReward) return false

        const addrs = filterOwnedAddresses(this.pAddrsClean, this.delegatorReward.addresses)
        return addrs.length
    }

    /**
     * Returns true if this wallet received validator reward
     */
    get receivedValidatorReward() {
        if (this.isValidator || !this.validatorReward) return false

        const addrs = filterOwnedAddresses(this.pAddrsClean, this.validatorReward.addresses)
        return addrs.length
    }

    // TODO: Add missing stake info for staking transactions, start/end date, potential reward, reward date, reward USD price
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
span.rewarded {
    color: var(--success);
}
.not_rewarded span {
    color: var(--error);
}
</style>
