<template>
    <div v-if="totLength > 0" class="user_rewards">
        <div>
            <label>{{ $t('earn.rewards.total') }}</label>
            <p class="amt">{{ totalRewardBig.toLocaleString(9) }} {{ nativeAssetSymbol }}</p>
        </div>
        <div v-if="validators.length > 0">
            <h3>{{ $t('earn.rewards.validation') }}</h3>
            <UserRewardRow
                v-for="(v, i) in validators"
                :key="i"
                :staker="v"
                class="reward_row"
            ></UserRewardRow>
        </div>
        <div v-if="delegators.length > 0">
            <h3>{{ $t('earn.rewards.delegation') }}</h3>
            <UserRewardRow
                v-for="(d, i) in delegators"
                :key="i"
                :staker="d"
                class="reward_row"
            ></UserRewardRow>
        </div>
    </div>
    <div v-else class="empty">
        <p>{{ $t('earn.rewards.empty') }}</p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'
import { AvaWalletCore } from '../../../js/wallets/types'
import { DelegatorRaw, ValidatorRaw } from '@/components/misc/ValidatorList/types'
import UserRewardRow from '@/components/wallet/earn/UserRewardRow.vue'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
import { BN } from '@c4tplatform/camino'

@Component({
    components: {
        UserRewardRow,
    },
})
export default class UserRewards extends Vue {
    get userAddresses() {
        let wallet: AvaWalletCore = this.$store.state.activeWallet
        if (!wallet) return []

        return wallet.getAllAddressesP()
    }

    get validators(): ValidatorRaw[] {
        let validators: ValidatorRaw[] = this.$store.state.Platform.validators

        return this.cleanList(validators) as ValidatorRaw[]
    }

    get delegators(): DelegatorRaw[] {
        let delegators: DelegatorRaw[] = []
        let validators: ValidatorRaw[] = this.$store.state.Platform.validators

        for (var i = 0; i < validators.length; i++) {
            let v = validators[i]
            if (v.delegators === null) continue
            delegators.push(...v.delegators)
        }

        return this.cleanList(delegators) as DelegatorRaw[]
    }

    get totLength() {
        return this.validators.length + this.delegators.length
    }

    get totalReward() {
        let vals = this.validators.reduce((acc, val: ValidatorRaw) => {
            return acc.add(new BN(val.potentialReward))
        }, new BN(0))

        let dels = this.delegators.reduce((acc, val: DelegatorRaw) => {
            return acc.add(new BN(val.potentialReward))
        }, new BN(0))

        return vals.add(dels)
    }

    get totalRewardBig(): Big {
        return bnToBig(this.totalReward, 9)
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }

    cleanList(list: ValidatorRaw[] | DelegatorRaw[]) {
        let res = list.filter((val) => {
            let rewardAddrs = val.rewardOwner.addresses
            let filtered = rewardAddrs.filter((addr) => {
                return this.userAddresses.includes(addr)
            })
            return filtered.length > 0
        })

        res.sort((a, b) => {
            let startA = parseInt(a.startTime)
            let startB = parseInt(b.startTime)
            return startA - startB
        })
        return res
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
    margin: 12px 0;
    margin-top: 32px;
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
