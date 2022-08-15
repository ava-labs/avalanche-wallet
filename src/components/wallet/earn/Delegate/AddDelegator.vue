<template>
    <div class="add_delegator">
        <NodeSelection v-if="!selected" @select="onselect" class="node_selection"></NodeSelection>
        <div class="cols" v-else>
            <div class="node_col">
                <button @click="selected = null" class="close_but button_secondary">
                    <fa icon="sync"></fa>
                    Change Node
                </button>
                <NodeCard :node="selected"></NodeCard>
            </div>
            <transition-group name="fade" mode="out-in">
                <div class="ins_col" key="form" v-show="!isConfirm">
                    <div style="margin-bottom: 30px">
                        <h4>{{ $t('earn.delegate.form.period.label') }}</h4>
                        <p class="desc">
                            {{ $t('earn.delegate.form.period.desc') }}
                        </p>
                        <DateForm @change_end="setEnd" :max-end-date="endMaxDate"></DateForm>
                    </div>
                    <div style="margin: 30px 0; margin-bottom: 50px">
                        <h4>{{ $t('earn.delegate.form.amount.label') }}</h4>
                        <p class="desc">
                            {{ $t('earn.delegate.form.amount.desc') }}
                        </p>
                        <!--                        <p class="desc">-->
                        <!--                            {{ $t('earn.delegate.form.amount.desc2', [remainingAmtText]) }}-->
                        <!--                        </p>-->
                        <AvaxInput
                            v-model="stakeAmt"
                            :max="maxAmt"
                            class="amt_in"
                            :balance="utxosBalanceBig"
                        ></AvaxInput>
                    </div>
                    <div class="reward_in" style="margin: 30px 0" :type="rewardDestination">
                        <h4>{{ $t('earn.delegate.form.reward.label') }}</h4>
                        <p class="desc">
                            {{ $t('earn.delegate.form.reward.desc') }}
                        </p>
                        <div class="reward_tabs">
                            <button
                                @click="rewardSelect('local')"
                                :selected="this.rewardDestination === 'local'"
                            >
                                {{ $t('earn.delegate.form.reward.chip_1') }}
                            </button>
                            <span>or</span>
                            <button
                                @click="rewardSelect('custom')"
                                :selected="this.rewardDestination === 'custom'"
                            >
                                {{ $t('earn.delegate.form.reward.chip_2') }}
                            </button>
                        </div>
                        <!--                        <v-chip-group mandatory @change="rewardSelect">-->
                        <!--                            <v-chip small value="local">-->
                        <!--                                {{ $t('earn.delegate.form.reward.chip_1') }}-->
                        <!--                            </v-chip>-->
                        <!--                            <v-chip small value="custom">-->
                        <!--                                {{ $t('earn.delegate.form.reward.chip_2') }}-->
                        <!--                            </v-chip>-->
                        <!--                        </v-chip-group>-->
                        <QrInput
                            v-model="rewardIn"
                            placeholder="Reward Address"
                            class="reward_addr_in"
                        ></QrInput>
                    </div>
                    <Expandable>
                        <template v-slot:triggerOn>
                            <p>
                                {{ $t('earn.shared.advanced.toggle_on') }}
                            </p>
                        </template>
                        <template v-slot:triggerOff>
                            <p>
                                {{ $t('earn.shared.advanced.toggle_off') }}
                            </p>
                        </template>
                        <template v-slot:content>
                            <UtxoSelectForm
                                style="margin: 10px 0"
                                v-model="formUtxos"
                            ></UtxoSelectForm>
                        </template>
                    </Expandable>
                </div>
                <ConfirmPage
                    v-show="isConfirm"
                    key="confirm"
                    :end="formEnd"
                    :amount="formAmt"
                    :reward-destination="rewardDestination"
                    :reward-address="formRewardAddr"
                    :node-i-d="formNodeID"
                ></ConfirmPage>
            </transition-group>
            <div>
                <div v-if="!isSuccess" class="summary">
                    <CurrencySelect
                        v-model="currency_type"
                        currency="currency_sel"
                    ></CurrencySelect>
                    <div>
                        <label>{{ $t('earn.delegate.summary.duration') }} *</label>
                        <p>{{ stakingDurationText }}</p>
                    </div>
                    <div>
                        <label>{{ $t('earn.delegate.summary.reward') }}</label>
                        <p v-if="currency_type === 'NATIVE'">
                            {{ estimatedReward.toLocaleString(2) }} {{ nativeAssetSymbol }}
                        </p>
                        <p v-if="currency_type === 'USD'">
                            ${{ estimatedRewardUSD.toLocaleString(2) }} USD
                        </p>
                    </div>
                    <div>
                        <label>{{ $t('earn.delegate.summary.fee') }}</label>
                        <p v-if="currency_type === 'NATIVE'">
                            {{ totalFeeBig.toLocaleString(2) }} {{ nativeAssetSymbol }}
                        </p>
                        <p v-if="currency_type === 'USD'">
                            ${{ totalFeeUsdBig.toLocaleString(2) }} USD
                        </p>
                    </div>

                    <div>
                        <label style="margin: 8px 0 !important">
                            * {{ $t('earn.delegate.summary.warn') }}
                        </label>
                        <p class="err">{{ err }}</p>
                        <v-btn
                            v-if="!isConfirm"
                            @click="confirm"
                            class="button_secondary"
                            depressed
                            :loading="isLoading"
                            :disabled="!canSubmit"
                            block
                        >
                            {{ $t('earn.delegate.confirm') }}
                        </v-btn>
                        <template v-else>
                            <v-btn
                                @click="submit"
                                class="button_secondary"
                                depressed
                                :loading="isLoading"
                                block
                            >
                                {{ $t('earn.delegate.submit') }}
                            </v-btn>
                            <v-btn
                                text
                                @click="cancelConfirm"
                                block
                                style="color: var(--primary-color); margin-top: 20px"
                            >
                                {{ $t('earn.delegate.cancel') }}
                            </v-btn>
                        </template>
                    </div>
                </div>
                <div v-else class="success_cont">
                    <h2>{{ $t('earn.delegate.success.title') }}</h2>
                    <p>{{ $t('earn.delegate.success.desc') }}</p>
                    <p class="tx_id">Tx ID: {{ txId }}</p>
                    <div class="tx_status">
                        <div>
                            <label>{{ $t('earn.delegate.success.status') }}</label>
                            <p v-if="!txStatus">Waiting..</p>
                            <p v-else>{{ txStatus }}</p>
                        </div>
                        <div class="status_icon">
                            <Spinner v-if="!txStatus"></Spinner>
                            <p style="color: var(--success)" v-if="txStatus === 'Committed'">
                                <fa icon="check-circle"></fa>
                            </p>
                            <p style="color: var(--error)" v-if="txStatus === 'Dropped'">
                                <fa icon="times-circle"></fa>
                            </p>
                        </div>
                    </div>
                    <div class="reason_cont" v-if="txReason">
                        <label>{{ $t('earn.delegate.success.reason') }}</label>
                        <p>{{ txReason }}</p>
                    </div>
                    <v-btn @click="cancel" block class="button_secondary" depressed v-if="txStatus">
                        Back to Earn
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

import AvaxInput from '@/components/misc/AvaxInput.vue'
//@ts-ignore
import { QrInput } from '@c4tplatform/vue_components'
import ValidatorsList from '@/components/misc/ValidatorList/ValidatorsList.vue'
import StakingCalculator from '@/components/wallet/earn/StakingCalculator.vue'
import ConfirmPage from '@/components/wallet/earn/Delegate/ConfirmPage.vue'
import Big from 'big.js'
import moment from 'moment'

import { BN } from '@c4tplatform/camino'
import { AmountOutput, UTXO } from '@c4tplatform/camino/dist/apis/platformvm'
import { ava, bintools } from '@/AVA'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { bnToBig, calculateStakingReward } from '@/helpers/helper'
import { ValidatorListItem } from '@/store/modules/platform/types'
import NodeSelection from '@/components/wallet/earn/Delegate/NodeSelection.vue'
import CurrencySelect from '@/components/misc/CurrencySelect/CurrencySelect.vue'
import Spinner from '@/components/misc/Spinner.vue'
import DateForm from '@/components/wallet/earn/DateForm.vue'
import { WalletType } from '@/js/wallets/types'

import UtxoSelectForm from '@/components/wallet/earn/UtxoSelectForm.vue'
import Expandable from '@/components/misc/Expandable.vue'
import NodeCard from '@/components/wallet/earn/Delegate/NodeCard.vue'

const MIN_MS = 60000
const HOUR_MS = MIN_MS * 60
const DAY_MS = HOUR_MS * 24

@Component({
    components: {
        NodeCard,
        UtxoSelectForm,
        DateForm,
        Spinner,
        CurrencySelect,
        NodeSelection,
        AvaxInput,
        ValidatorsList,
        StakingCalculator,
        QrInput,
        ConfirmPage,
        Expandable,
    },
})
export default class AddDelegator extends Vue {
    search: string = ''
    selected: ValidatorListItem | null = null
    stakeAmt: BN = new BN(0)
    startDate: string = new Date(Date.now() + MIN_MS * 15).toISOString()
    endDate: string = new Date().toISOString()
    rewardIn: string = ''
    rewardDestination = 'local' // local || custom
    err: string = ''
    isLoading = false
    isConfirm = false
    isSuccess = false
    txId = ''
    txStatus = ''
    txReason: null | string = null

    formNodeID = ''
    formUtxos: UTXO[] = []
    formAmt = new BN(0)
    formEnd: Date = new Date()
    formRewardAddr = ''

    currency_type = 'NATIVE'

    mounted() {
        this.rewardSelect('local')
    }
    setEnd(val: string) {
        this.endDate = val
    }

    onselect(val: ValidatorListItem) {
        this.search = ''
        this.selected = val
    }

    async submit() {
        if (!this.formCheck()) {
            return
        }

        this.isLoading = true
        this.err = ''

        let wallet: WalletType = this.$store.state.activeWallet

        // Start delegation in 5 minutes
        let startDate = new Date(Date.now() + 5 * MIN_MS)

        try {
            this.isLoading = false
            let txId = await wallet.delegate(
                this.formNodeID,
                this.formAmt,
                startDate,
                this.formEnd,
                this.formRewardAddr,
                this.formUtxos
            )
            this.isSuccess = true
            this.txId = txId
            this.updateTxStatus(txId)
        } catch (e) {
            this.onerror(e)
            this.isLoading = false
        }
    }

    onsuccess(txId: string) {
        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Delegator Added',
            message: 'Your tokens are now locked for staking.',
        })

        // Update History
        setTimeout(() => {
            this.$store.dispatch('Assets/updateUTXOs')
            this.$store.dispatch('History/updateTransactionHistory')
        }, 3000)
    }

    async updateTxStatus(txId: string) {
        let res = await ava.PChain().getTxStatus(txId)
        let status
        let reason = null
        if (typeof res === 'string') {
            status = res
        } else {
            status = res.status
            reason = res.reason
        }

        if (!status || status === 'Processing' || status === 'Unknown') {
            setTimeout(() => {
                this.updateTxStatus(txId)
            }, 5000)
        } else {
            this.txStatus = status
            this.txReason = reason

            if (status === 'Committed') {
                this.onsuccess(txId)
            }
        }
    }

    onerror(e: any) {
        console.error(e)
        let msg: string = e.message

        if (msg.includes('startTime')) {
            this.err = this.$t('earn.delegate.errs.start_end') as string
            // this.err = "Start date must be in the future and end date must be after start date."
        } else if (msg.includes('address format')) {
            this.err = this.$t('earn.delegate.errs.invalid_addr') as string
            // this.err = "Invalid address format. Your address must start with \"P-\"";
        } else {
            this.err = e.message
        }
        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Delegation Failed',
            message: 'Failed to delegate tokens.',
        })
    }

    get estimatedReward(): Big {
        let start = new Date(this.startDate)
        let end = new Date(this.endDate)
        let duration = end.getTime() - start.getTime() // in ms

        let currentSupply = this.$store.state.Platform.currentSupply

        let estimation = calculateStakingReward(this.stakeAmt, duration / 1000, currentSupply)
        let res = Big(estimation.toString()).div(Math.pow(10, 9))
        return res
    }

    get estimatedRewardUSD() {
        return this.estimatedReward.times(this.avaxPrice)
    }

    get avaxPrice(): Big {
        return Big(this.$store.state.prices.usd)
    }

    rewardSelect(val: 'local' | 'custom') {
        if (val === 'local') {
            this.rewardIn = this.rewardAddressLocal
        } else {
            this.rewardIn = ''
        }
        this.rewardDestination = val
    }

    get rewardAddressLocal() {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet.getPlatformRewardAddress()
    }

    formCheck(): boolean {
        this.err = ''

        if (!this.selected) {
            this.err = this.$t('earn.delegate.errs.no_node') as string
            // this.err = "You must specify a validator."
            return false
        }

        let startTime = new Date(this.startDate).getTime()
        let endTime = new Date(this.endDate).getTime()
        let now = Date.now()
        let diffTime = endTime - startTime

        if (startTime <= now) {
            this.err = this.$t('earn.delegate.errs.start_now') as string
            return false
        }

        // TODO: UPDATE THIS WITH REAL VALUE
        if (diffTime < DAY_MS * 14) {
            this.err = this.$t('earn.delegate.errs.min_dur') as string
            return false
        }

        if (diffTime > DAY_MS * 365) {
            this.err = this.$t('earn.delegate.errs.max_dur') as string
            return false
        }

        let validatorEndtime = this.selected.endTime.getTime()

        if (endTime > validatorEndtime) {
            this.err = this.$t('earn.delegate.errs.val_end') as string
            return false
        }

        // Reward address check
        if (this.rewardDestination != 'local' && !this.rewardIn) {
            this.err = this.$t('earn.delegate.errs.no_addr') as string
            return false
        }

        // Validate reward address
        try {
            bintools.stringToAddress(this.rewardIn)
        } catch (e) {
            this.err = this.$t('earn.delegate.errs.invalid_addr') as string
            // this.err = "Invalid reward address."
            return false
        }

        // Stake amount check
        if (this.stakeAmt.lt(this.minStake)) {
            let big = bnToBig(this.minStake, 9)
            this.err = this.$t('earn.delegate.errs.amt', [big.toLocaleString()]) as string
            return false
        }

        return true
    }

    updateFormData() {
        this.formNodeID = this.selected!.nodeID
        this.formAmt = this.stakeAmt
        this.formEnd = new Date(this.endDate)
        this.formRewardAddr = this.rewardIn
    }

    confirm() {
        if (!this.formCheck()) return
        this.updateFormData()
        this.isConfirm = true
    }

    cancelConfirm() {
        this.isConfirm = false
    }

    get canSubmit(): boolean {
        if (this.stakeAmt.isZero()) {
            return false
        }
        return true
    }

    // Maximum end date is end of validator's staking duration
    get endMaxDate(): string | undefined {
        if (!this.selected) return undefined

        return this.selected.endTime.toISOString()
    }

    get stakingDuration(): number {
        let start = new Date(this.startDate)
        let end = new Date(this.endDate)
        let dur = end.getTime() - start.getTime()
        return dur
    }

    get stakingDurationText(): string {
        let dur = this.stakingDuration
        let d = moment.duration(dur, 'milliseconds')
        // return d.humanize()
        let days = Math.floor(d.asDays())
        return `${days} days ${d.hours()} hours ${d.minutes()} minutes`
    }

    get minStake(): BN {
        return this.$store.state.Platform.minStakeDelegation
    }

    get delegationFee(): number {
        if (!this.selected) return 0
        return this.selected.fee
    }

    get totalFee(): BN {
        let delegationFee = Big(this.delegationFee).div(Big(100))
        let cut = this.estimatedReward.times(delegationFee)

        let txFee: BN = ava.PChain().getTxFee()
        let cutBN = new BN(cut.times(Math.pow(10, 9)).toFixed(0))
        let totFee = txFee.add(cutBN)
        return totFee
    }

    get totalFeeBig() {
        return bnToBig(this.totalFee, 9)
    }

    get totalFeeUsdBig() {
        return this.totalFeeBig.times(this.avaxPrice)
    }

    get txFee(): BN {
        return ava.PChain().getTxFee()
    }

    get txFeeBig(): Big {
        return bnToBig(this.txFee, 9)
    }

    get feeText(): string {
        let big = this.totalFeeBig
        return big.toLocaleString(0)
    }

    get minAmt(): BN {
        return this.minStake.add(this.txFee)
    }

    get remainingAmt(): BN {
        if (!this.selected) return new BN(0)
        // let totDel: BN = this.$store.getters["Platform/validatorTotalDelegated"](this.selected.nodeID);
        let nodeMaxStake: BN = this.$store.getters['Platform/validatorMaxStake'](this.selected)

        let totDel = this.selected.delegatedStake
        let valAmt = this.selected.validatorStake
        return nodeMaxStake.sub(totDel).sub(valAmt)
    }

    get remainingAmtText() {
        let bn = this.remainingAmt
        return bnToBig(bn, 9).toLocaleString()
    }

    get utxosBalance(): BN {
        return this.formUtxos.reduce((acc, val: UTXO) => {
            let out = val.getOutput() as AmountOutput
            return acc.add(out.getAmount())
        }, new BN(0))
    }

    get utxosBalanceBig(): Big {
        return bnToBig(this.utxosBalance, 9)
    }

    get maxAmt(): BN {
        let zero = new BN(0)

        let totAvailable = this.utxosBalance

        if (zero.gt(totAvailable)) return zero

        if (totAvailable.gt(this.remainingAmt)) return this.remainingAmt

        return totAvailable
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }

    // Go Back to earn
    cancel() {
        this.$emit('cancel')
    }

    // get stakeAmtText() {
    //     let amt = this.stakeAmt
    //     let big = Big(amt.toString()).div(Math.pow(10, 9))
    //
    //     if (big.lte(Big('0.0001'))) {
    //         return big.toLocaleString(9)
    //     }
    //     return big.toLocaleString(2)
    // }
    //
    // get platformUnlocked(): BN {
    //     return this.$store.getters.walletPlatformBalance
    // }

    get platformLockedStakeable(): BN {
        return this.$store.getters['Assets/walletPlatformBalanceLockedStakeable']
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.add_delegator {
    height: 100%;
    padding-bottom: 5vh;
}

.node_selection {
    height: 100%;
}

.cols {
    display: grid;
    grid-template-columns: max-content 1fr 340px;
    column-gap: 2vw;
}

.ins_col {
    margin: 0px auto;
    align-self: flex-end;
    justify-self: flex-end;
    max-width: 490px;
    padding-bottom: 8vh;
}

form {
    width: 100%;
}

h4 {
    font-weight: bold;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

.close_but {
    padding: 2px 14px;
    font-size: 13px;
    border-radius: 6px;
    margin-bottom: 14px;
}

.node_col {
    max-width: 390px;
}
.selected {
    display: flex;
    flex-wrap: wrap;
    //width: max-content;
    //display: grid;
    position: relative;
    grid-template-columns: max-content max-content max-content;
    column-gap: 14px;
    background-color: var(--bg-light);
    border-radius: 6px;
    padding: 4px 0;
    padding-left: 34px;
    padding-right: 14px;

    .id_box {
        //grid-column: 1/3;
    }

    button {
        opacity: 0.4;
        &:hover {
            opacity: 1;
        }
    }
}

.amt_in {
    width: 100%;
}

.dates {
    //display: grid;
    //grid-template-columns: 1fr 1fr;
    //grid-gap: 15px;
    display: flex;
    > div {
        flex-grow: 1;
        margin-right: 15px;
    }

    label > span {
        float: right;
        opacity: 0.4;
        cursor: pointer;
        &:hover {
            opacity: 1;
        }
    }
}

/*.amt_in{*/
/*    background-color: var(--bg-light);*/
/*    color: var(--primary-color);*/
/*    padding: 8px 14px;*/
/*    width: 100%;*/
/*}*/

.reward_in {
    width: 100%;
    transition-duration: 0.2s;
    &[type='local'] {
        .reward_addr_in {
            opacity: 0.3;
            user-select: none;
            cursor: not-allowed;
            pointer-events: none;
            width: 100%;
            height: 40px;
            border-radius: 2px;
        }
    }
}

.reward_tabs {
    margin-bottom: 8px;
    font-size: 13px;
    button {
        color: var(--primary-color-light);

        &:hover {
            color: var(--primary-color);
        }

        &[selected] {
            color: var(--secondary-color);
        }
    }

    span {
        margin: 0px 12px;
    }
}

.desc {
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
}

.summary {
    border-left: 2px solid var(--bg-light);
    padding-left: 30px;
    > div {
        margin-bottom: 14px;
        p {
            font-size: 24px;
        }
    }

    .err {
        margin: 14px 0 !important;
        font-size: 14px;
    }

    .v-btn {
        margin-top: 14px;
    }
}

//.currency_sel {
//    margin-top: 0 !important;
//}

.tx_status {
    display: flex;
    justify-content: space-between;

    .status_icon {
        align-items: center;
        display: flex;
        font-size: 24px;
    }
}

.tx_status,
.reason_cont {
    background-color: var(--bg-light);
    padding: 4px 12px;
    margin-bottom: 6px;
}

.success_cont {
    .check {
        font-size: 4em;
        color: var(--success);
    }

    .tx_id {
        font-size: 13px;
        color: var(--primary-color-light);
        word-break: break-all;
        margin: 14px 0 !important;
        font-weight: bold;
    }
}

@include main.medium-device {
    .summary {
        > div {
            margin-bottom: 10px;
            p {
                font-size: 18px;
            }
        }
    }

    .cols {
        grid-template-columns: 220px 2fr 240px;
    }
}

@include main.mobile-device {
    .cols {
        grid-template-columns: 1fr;
    }

    .dates {
        grid-template-columns: 1fr;
    }

    .amt_in {
        width: 100%;
    }

    .summary {
        border-left: none;
        border-top: 2px solid var(--bg-light);
        padding-left: 0;
        padding-top: 30px;
    }

    .ins_col {
        width: 100%;
        max-width: 100%;
    }

    .close_but {
        width: 100%;
        padding: 12px;
    }

    .node_col {
        margin-bottom: 24px;
    }
}
</style>
