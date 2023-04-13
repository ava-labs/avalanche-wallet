<template>
    <div class="earn_page">
        <div class="header">
            <h1 :class="depositAndBond ? '' : 'wrong_network'" v-if="validatorIsSuspended">
                {{ $t('validator.suspended.title') }}
            </h1>
            <div v-else-if="(nodeInfo === undefined || nodeInfo === null) && !validatorIsSuspended">
                <h1 v-if="!!multisigPendingNodeTx && !isNodeRegistered">
                    {{ $t('earn.subtitle5') }}
                </h1>
                <h1 v-else>{{ $t('earn.subtitle1') }}</h1>
            </div>
            <h1 v-else :class="depositAndBond ? '' : 'wrong_network'">
                {{ $t('validator.info.validator_running') }}
            </h1>
        </div>
        <transition name="fade" mode="out-in">
            <div>
                <p v-if="!depositAndBond" class="wrong_network">{{ $t('earn.warning_3') }}</p>
                <div v-else-if="!isNodeRegistered" class="no_balance">
                    <pending-multisig
                        v-if="!!multisigPendingNodeTx"
                        :multisigTx="multisigPendingNodeTx"
                        @issued="onNodeRegistered"
                        @refresh="handlePendingMultisigRefresh"
                    ></pending-multisig>
                    <register-node
                        v-else
                        :isKycVerified="isKycVerified"
                        :isConsortiumMember="isConsortiumMember"
                        :minPlatformUnlocked="minPlatformUnlocked"
                        :hasEnoughLockablePlatformBalance="hasEnoughLockablePlatformBalance"
                        :isNodeRegistered="isNodeRegistered"
                        @registered="onNodeRegistered"
                        :loadingRefreshRegisterNode="loadingRefreshRegisterNode"
                        @refresh="refresh()"
                    ></register-node>
                </div>
                <template v-else-if="!!pendingValidator">
                    <validator-pending :startDate="pendingValidator.startTime"></validator-pending>
                </template>
                <template
                    v-else-if="
                        (nodeInfo === undefined || nodeInfo === null) &&
                        !validatorIsSuspended &&
                        !pendingValidator
                    "
                >
                    <pending-multisig
                        v-if="!!multisigPendingNodeTx"
                        :nodeId="nodeId"
                        :multisigTx="multisigPendingNodeTx"
                        @issued="onAddValidatorIssued"
                        @refresh="handlePendingMultisigRefresh"
                    ></pending-multisig>
                    <add-validator
                        v-else
                        :nodeId="nodeId"
                        @validatorReady="verifyValidatorIsReady"
                        @initiated="onAddValidatorInitiated"
                    ></add-validator>
                </template>
                <div v-else-if="validatorIsSuspended">
                    <validator-suspended :nodeId="nodeId"></validator-suspended>
                </div>
                <div v-else>
                    <div class="tab-nav">
                        <div>
                            <button
                                @click="tab = 'opt-validator'"
                                :active="tab === `opt-validator`"
                            >
                                {{ $t('validator.rewards.tab.node') }}
                            </button>
                            <button @click="tab = 'opt-rewards'" :active="tab === `opt-rewards`">
                                {{ $t('validator.rewards.tab.rewards') }}
                            </button>
                        </div>
                    </div>

                    <div v-if="tab == 'opt-validator'">
                        <validator-info :nodeId="nodeId" :nodeInfo="nodeInfo"></validator-info>
                    </div>
                    <div v-if="tab == 'opt-rewards'">
                        <ClaimRewards :nodeId="nodeId" :nodeInfo="nodeInfo" />
                    </div>
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
import ClaimRewards from '@/components/wallet/earn/Validate/ClaimRewards.vue'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'
import { WalletCore } from '@/js/wallets/WalletCore'
import PendingMultisig from '@/components/wallet/earn/Validate/PendingMultisig.vue'
import { MultisigTx as SignavaultTx } from '@/store/modules/signavault/types'
import ValidatorPending from '@/components/wallet/earn/Validate/ValidatorPending.vue'

@Component({
    name: 'validator',
    components: {
        RegisterNode,
        AddValidator,
        ValidatorInfo,
        ValidatorSuspended,
        ClaimRewards,
        PendingMultisig,
        ValidatorPending,
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
    tab: string = 'opt-validator'
    pendingValidator: ValidatorRaw | null = null

    get multisigPendingNodeTx(): SignavaultTx | undefined {
        return this.$store.getters['Signavault/transactions'].find(
            (item: any) => item?.tx?.alias === this.addresses[0]
        )
    }

    verifyValidatorIsReady(val: ValidatorRaw) {
        this.nodeInfo = val
    }

    updateValidators() {
        this.$store.dispatch('Platform/updateValidators')
    }

    activated() {
        this.evaluateCanRegisterNode()
        this.updateValidators()
        this.intervalID = setInterval(() => {
            this.updateValidators()
        }, 15000)
    }

    async handlePendingMultisigRefresh() {
        await this.$store.dispatch('Signavault/updateTransaction')
        this.evaluateCanRegisterNode()
    }

    deactivated() {
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

            if (this.nodeId) {
                // node is registered, check if is pending
                const val = await WalletHelper.findPendingValidator(this.nodeId)
                this.pendingValidator = val
            }
        } catch (e) {
            this.isNodeRegistered = false
            this.pendingValidator = null
        }
    }

    async onNodeRegistered(status: 'issued' | 'pending') {
        if (status === 'issued') {
            try {
                this.nodeId = await WalletHelper.getRegisteredNode(this.addresses[0])
                this.isNodeRegistered = !!this.nodeId
            } catch (e) {
                this.isNodeRegistered = false
            }
        } else {
            await this.$store.dispatch('Signavault/updateTransaction')
            this.evaluateCanRegisterNode()
        }
    }

    async onAddValidatorInitiated() {
        //  Multisig flow, tx is saved to signavault
        await this.$store.dispatch('Signavault/updateTransaction')
        this.evaluateCanRegisterNode()
    }

    async onAddValidatorIssued() {
        //  Multisig flow, tx handled by signavault
        await this.$store.dispatch('Signavault/updateTransaction')
        this.evaluateCanRegisterNode()
    }

    get hasEnoughLockablePlatformBalance(): boolean {
        return this.platformStakeable.gte(this.minPlatformUnlocked)
    }

    get platformStakeable(): BN {
        return this.platformUnlocked.add(this.platformLockedStakeable)
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

    .tab-nav {
        button {
            font-size: 13px;

            &[active] {
                border-bottom-width: 2px;
            }
        }
    }
}

@include mixins.mobile-device {
    .options {
        grid-template-columns: none;
        grid-row-gap: 15px;
    }

    .tab-nav {
        display: block;

        > div {
            overflow: hidden;
            display: flex;
        }
        button {
            flex-grow: 1;
            border-radius: 0px;
            margin: 0;
            font-size: 12px;
        }
    }
}

.tab-nav {
    display: flex;
    align-items: center;
    border-bottom: 2px solid transparent;
    flex-wrap: nowrap;
    white-space: nowrap;

    h1 {
        font-weight: normal;
        margin-right: 30px;
    }

    button {
        padding: 8px 24px;
        font-size: 14px;
        font-weight: bold;
        margin: 0px 5px;
        text-transform: uppercase;
        outline: none !important;
        color: var(--primary-color-light);

        &[active] {
            color: var(--secondary-color);
            border-bottom: 2px solid var(--secondary-color);
        }
    }
}
</style>
