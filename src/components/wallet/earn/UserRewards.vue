<template>
    <div>
        <template v-if="totLength > 0">
            <div>
                <label>{{ $t('earn.rewards.total') }}</label>
                <p class="amt">{{ totalRewardBig.toLocaleString(9) }} AVAX</p>
            </div>
            <div v-if="validatorTxs.length > 0">
                <h3>{{ $t('earn.rewards.validation') }}</h3>
                <UserRewardRow
                    v-for="v in validatorTxs"
                    :key="v.txHash"
                    :tx="v"
                    class="reward_row"
                ></UserRewardRow>
            </div>

            <div v-if="delegatorTxs.length > 0">
                <h3>{{ $t('earn.rewards.delegation') }}</h3>
                <UserRewardRow
                    v-for="v in delegatorTxs"
                    :key="v.txHash"
                    :tx="v"
                    class="reward_row"
                ></UserRewardRow>
            </div>
        </template>
        <template v-else>
            <p style="text-align: center">{{ $t('earn.rewards.empty') }}</p>
        </template>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AvaWalletCore } from '../../../js/wallets/types'
import UserRewardRow from '@/components/wallet/earn/UserRewardRow.vue'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
import { BN } from 'avalanche'
import { EarnState } from '@/store/modules/earn/types'

@Component({
    components: {
        UserRewardRow,
    },
})
export default class UserRewards extends Vue {
    updateInterval: ReturnType<typeof setInterval> | undefined = undefined

    get userAddresses() {
        let wallet: AvaWalletCore = this.$store.state.activeWallet
        if (!wallet) return []

        return wallet.getAllAddressesP()
    }

    created() {
        this.$store.dispatch('Earn/refreshRewards')

        // Update every 5 minutes
        this.updateInterval = setInterval(() => {
            this.$store.dispatch('Earn/refreshRewards')
        }, 5 * 60 * 1000)
    }

    destroyed() {
        // Clear interval if exists
        this.updateInterval && clearInterval(this.updateInterval)
    }

    get stakingTxs() {
        return this.$store.state.Earn.stakingTxs as EarnState['stakingTxs']
    }

    get validatorTxs() {
        return this.stakingTxs.filter((tx) => tx.txType === 'AddValidatorTx')
    }

    get delegatorTxs() {
        return this.stakingTxs.filter((tx) => tx.txType === 'AddDelegatorTx')
    }

    get totLength() {
        return this.validatorTxs.length + this.delegatorTxs.length
    }

    get totalReward() {
        let tot = this.stakingTxs.reduce((acc, val) => {
            return acc.add(new BN(val.estimatedReward ?? 0))
        }, new BN(0))
        return tot
    }

    get totalRewardBig(): Big {
        return bnToBig(this.totalReward, 9)
    }
}
</script>
<style scoped lang="scss">
.user_rewards {
    padding-bottom: 5vh;
}

.reward_row {
    margin-bottom: 12px;
}

h3 {
    margin-top: 0.3em;
    font-size: 2em;
    color: var(--primary-color-light);
    font-weight: lighter;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

.amt {
    font-size: 2em;
}
</style>
