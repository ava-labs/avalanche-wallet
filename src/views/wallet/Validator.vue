<template>
    <div class="earn_page">
        <div class="header">
            <!-- <h1>{{ $t('earn.title') }}</h1> -->
            <!-- <h1>Validator</h1> -->
            <h1>
                {{ subtitle }}
            </h1>
        </div>
        <transition name="fade" mode="out-in">
            <div>
                <p v-if="!canValidate" class="no_balance">
                    {{ $t('earn.warning_1', [minStakeAmt.toLocaleString()]) }}
                </p>
                <template v-else>
                    <add-validator></add-validator>
                </template>
                <!-- <component :is="pageNow" class="comp" @cancel="cancel"></component> -->
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { ava } from '@/AVA'
import AddValidator from '@/components/wallet/earn/Validate/AddValidator.vue'
import { BN } from '@c4tplatform/caminojs/dist'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'

@Component({
    name: 'validator',
    components: {
        AddValidator,
    },
})
export default class Validator extends Vue {
    subtitle: string = this.$t('earn.subtitle1') as string
    intervalID: any = null
    depositAndBound: Boolean =
        ava.getNetwork().P.lockModeBondDeposit && ava.getNetwork().P.verifyNodeSignature

    @Watch('$store.state.Network.selectedNetwork.networkId')
    SupportdepositAndBound(): void {
        this.depositAndBound =
            ava.getNetwork().P.lockModeBondDeposit && ava.getNetwork().P.verifyNodeSignature
    }

    updateValidators() {
        this.$store.dispatch('Platform/update')
    }

    created() {
        this.updateValidators()
        this.intervalID = setInterval(() => {
            this.updateValidators()
        }, 15000)
    }

    destroyed() {
        clearInterval(this.intervalID)
    }

    get platformUnlocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalance']
    }

    get platformLockedStakeable(): BN {
        // return this.$store.getters.walletPlatformBalanceLockedStakeable
        return this.$store.getters['Assets/walletPlatformBalanceLockedStakeable']
    }

    get platformTotalLocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalanceTotalLocked']
    }

    get totBal(): BN {
        if (this.depositAndBound) return this.platformUnlocked.add(this.platformTotalLocked)
        return this.platformUnlocked.add(this.platformLockedStakeable)
    }

    get pNoBalance() {
        if (this.depositAndBound)
            return this.platformUnlocked.add(this.platformTotalLocked).isZero()
        return this.platformUnlocked.add(this.platformLockedStakeable).isZero()
    }

    get canValidate(): boolean {
        let bn = this.$store.state.Platform.minStake
        if (this.totBal.lt(bn)) {
            return false
        }
        return true
    }

    get minStakeAmt(): Big {
        let bn = this.$store.state.Platform.minStake
        return bnToBig(bn, 9)
    }

    get minDelegationAmt(): Big {
        let bn = this.$store.state.Platform.minStakeDelegation
        return bnToBig(bn, 9)
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
/* body {
    height: auto;
    overflow: auto !important;
} */
.earn_page {
    display: grid;
    grid-template-rows: max-content 1fr;
}
.header {
    h1 {
        font-weight: normal;
    }
    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    .subtitle {
        margin-left: 0.5em;
        /*font-size: 20px;*/
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    span {
        margin-left: 1em;

        &:hover {
            color: var(--primary-color);
            cursor: pointer;
        }
    }
}
.options {
    margin: 30px 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 14px;
    //display: flex;
    //justify-content: space-evenly;
    //padding: 60px;

    > div {
        width: 100%;
        justify-self: center;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        //max-width: 260px;
        padding: 30px;
        border-radius: var(--border-radius-sm);
        background-color: var(--bg-light);
    }

    h4 {
        font-size: 32px !important;
        font-weight: lighter;
        color: var(--primary-color-light);
    }

    p {
        /*color: var(--primary-color-light);*/
        margin: 14px 0 !important;
    }

    .no_balance {
        color: var(--secondary-color);
    }

    .v-btn {
        margin-top: 14px;
    }
}

span {
    color: var(--primary-color-light);
    opacity: 0.5;
    float: right;
    font-weight: lighter;
}

.cancel {
    font-size: 13px;
    color: var(--secondary-color);
    justify-self: flex-end;
}

.comp {
    margin-top: 14px;
}

@include main.medium-device {
    .options {
        grid-template-columns: 1fr 1fr;
    }
}

@include main.mobile-device {
    .options {
        grid-template-columns: none;
        grid-row-gap: 15px;
    }
}
</style>
