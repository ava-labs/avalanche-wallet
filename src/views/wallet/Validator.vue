<template>
    <div class="earn_page">
        <div class="header">
            <h1 :class="depositAndBond ? '' : 'wrong_network'" v-if="validatorIsSuspended">
                {{ $t('validator.suspended.title') }}
            </h1>
            <h1
                v-else-if="(nodeInfo === undefined || nodeInfo === null) && !validatorIsSuspended"
                :class="depositAndBond ? '' : 'wrong_network'"
            >
                {{ $t('earn.subtitle1') }}
            </h1>
            <h1 v-else :class="depositAndBond ? '' : 'wrong_network'">
                {{ $t('validator.info.validator_running') }}
            </h1>
        </div>
        <transition name="fade" mode="out-in">
            <div>
                <p v-if="!depositAndBond" class="wrong_network">{{ $t('earn.warning_3') }}</p>
                <p v-else-if="!canValidate" class="no_balance">
                    {{ $t('earn.warning_1', [minStakeAmt.toLocaleString()]) }}
                </p>
                <p v-else-if="!isNodeRegistered" class="no_balance">
                    <register-node
                        :isKycVerified="isKycVerified"
                        :isConsortiumMember="isConsortiumMember"
                        :minPlatformUnlocked="minPlatformUnlocked"
                        :hasEnoughLockablePlatformBalance="hasEnoughUnlockedPlatformBalance"
                        :isNodeRegistered="isNodeRegistered"
                        @registered="onNodeRegistered"
                        :loadingRefreshRegisterNode="loadingRefreshRegisterNode"
                        @refresh="refresh()"
                    ></register-node>
                </p>
                <template
                    v-else-if="
                        (nodeInfo === undefined || nodeInfo === null) && !validatorIsSuspended
                    "
                >
                    <add-validator
                        :nodeId="nodeId"
                        @validatorReady="verifyValidatorIsReady"
                    ></add-validator>
                </template>
                <div v-else-if="validatorIsSuspended">
                    <validator-suspended :nodeId="nodeId"></validator-suspended>
                </div>
                <div v-else>
                    <validator-info :nodeId="nodeId" :nodeInfo="nodeInfo"></validator-info>
                </div>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Vue, Watch } from 'vue-property-decorator'
import AddValidator from '@/components/wallet/earn/Validate/AddValidator.vue'
import { BN } from '@c4tplatform/caminojs/dist'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
import { WalletHelper } from '@/helpers/wallet_helper'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import RegisterNode from '@/components/wallet/earn/Validate/RegisterNode.vue'
import {
    ADDRESSSTATECONSORTIUM,
    ADDRESSSTATEKYCVERIFIED,
    ADDRESSSTATEDEFERRED,
} from '@c4tplatform/caminojs/dist/apis/platformvm/addressstatetx'
import ValidatorInfo from '@/components/wallet/earn/Validate/ValidatorInfo.vue'
import ValidatorSuspended from '@/components/wallet/earn/Validate/ValidatorSuspended.vue'
import { WalletCore } from '@/js/wallets/WalletCore'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'

@Component({
    name: 'validator',
    components: {
        RegisterNode,
        AddValidator,
        ValidatorInfo,
        ValidatorSuspended,
    },
})
export default class Validator extends Vue {
    isKycVerified = false
    isConsortiumMember = false
    isNodeRegistered = false
    isSuspended = false
    registeredNodeID = ''
    intervalID: any = null
    nodeId = ''
    nodeInfo: ValidatorRaw | null = null
    validatorIsSuspended: boolean = false
    loadingRefreshRegisterNode: boolean = false

    verifyValidatorIsReady(val: ValidatorRaw) {
        this.nodeInfo = val
    }

    updateValidators() {
        this.$store.dispatch('Platform/update')
    }

    async created() {
        await this.evaluateCanRegisterNode()
        this.updateValidators()
        this.intervalID = setInterval(() => {
            this.updateValidators()
        }, 15000)
    }

    destroyed() {
        clearInterval(this.intervalID)
    }

    @Watch('$store.state.networkName')
    @Watch('$store.state.activeWallet')
    async evaluateCanRegisterNode() {
        const BN_ONE = new BN(1)
        const result = await WalletHelper.getAddressState(this.addresses[0])
        this.isKycVerified = !result.and(BN_ONE.shln(ADDRESSSTATEKYCVERIFIED)).isZero()
        this.isConsortiumMember = !result.and(BN_ONE.shln(ADDRESSSTATECONSORTIUM)).isZero()
        this.validatorIsSuspended = !result.and(BN_ONE.shln(ADDRESSSTATEDEFERRED)).isZero()

        try {
            this.nodeId = await WalletHelper.getRegisteredNode(this.addresses[0])
            this.isNodeRegistered = !!this.nodeId
        } catch (e) {
            this.isNodeRegistered = false
        }
    }

    async onNodeRegistered() {
        try {
            this.nodeId = await WalletHelper.getRegisteredNode(this.addresses[0])
            this.isNodeRegistered = !!this.nodeId
        } catch (e) {
            this.isNodeRegistered = false
        }
    }

    get hasEnoughUnlockedPlatformBalance(): boolean {
        return this.platformUnlocked.gte(this.minPlatformUnlocked)
    }

    get staticAddress() {
        return (this.$store.state.activeWallet as WalletCore).getStaticAddress('P')
    }

    get addresses() {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet.getAllAddressesP()
    }

    get platformUnlocked(): BN {
        if (this.depositAndBond) return this.$store.getters['Assets/walletPlatformBalanceUnlocked']
        else return this.$store.getters['Assets/walletPlatformBalance']
    }

    get minPlatformUnlocked(): BN {
        return this.$store.state.Platform.minStake
    }

    get depositAndBond(): boolean {
        return this.$store.getters['Network/depositAndBond']
    }

    get platformLockedStakeable(): BN {
        if (this.depositAndBond) return this.$store.getters['Assets/walletPlatformBalanceDeposited']
        return this.$store.getters['Assets/walletPlatformBalanceLockedStakeable']
    }

    get platformTotalLocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalanceTotalLocked']
    }

    get totBal(): BN {
        if (this.depositAndBond) {
            return this.platformUnlocked.add(this.platformTotalLocked)
        }
        return this.platformUnlocked.add(this.platformLockedStakeable)
    }

    get pNoBalance() {
        if (this.depositAndBond) return this.platformUnlocked.add(this.platformTotalLocked).isZero()
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

    async refresh() {
        this.loadingRefreshRegisterNode = true
        await this.evaluateCanRegisterNode()
        this.loadingRefreshRegisterNode = false
    }

    get hasValidator(): boolean {
        return this.$store.getters['Platform/isValidator'](this.registeredNodeID)
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/abstracts/mixins';

/* body {
    height: auto;
    overflow: auto !important;
} */
.earn_page {
    display: grid;
    grid-template-rows: max-content 1fr;
}

.header {
    margin-bottom: 1rem;

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

.wrong_network {
    color: var(--primary-color-light);
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

@include mixins.medium-device {
    .options {
        grid-template-columns: 1fr 1fr;
    }
}

@include mixins.mobile-device {
    .options {
        grid-template-columns: none;
        grid-row-gap: 15px;
    }
}
</style>
