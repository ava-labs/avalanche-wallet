<template>
    <div>
        <div class="cols">
            <form @submit.prevent="">
                <transition-group name="fade" mode="out-in">
                    <div v-show="!isConfirm" key="form" class="ins_col">
                        <div style="margin-bottom: 30px">
                            <h4>{{ $t('earn.validate.label_1') }}</h4>
                            <input
                                type="text"
                                v-model="nodeId"
                                style="width: 100%"
                                placeholder="NodeID-"
                            />
                        </div>
                        <div style="margin: 30px 0">
                            <h4>{{ $t('earn.validate.duration.label') }}</h4>
                            <p class="desc">
                                {{ $t('earn.validate.duration.desc') }}
                            </p>
                            <DateForm @change_end="setEnd"></DateForm>
                        </div>
                        <div style="margin: 30px 0">
                            <h4>{{ $t('earn.validate.amount.label') }}</h4>
                            <p class="desc">
                                {{ $t('earn.validate.amount.desc') }}
                            </p>
                            <AvaxInput v-model="stakeAmt" :max="maxAmt" class="amt_in"></AvaxInput>
                        </div>
                        <div style="margin: 30px 0">
                            <h4>{{ $t('earn.validate.fee.label') }}</h4>
                            <p class="desc">
                                {{ $t('earn.validate.fee.desc') }}
                            </p>
                            <input
                                type="number"
                                :min="minFee"
                                max="100"
                                step="0.01"
                                v-model="delegationFee"
                                @change="onFeeChange"
                            />
                        </div>
                        <div class="reward_in" style="margin: 30px 0" :type="rewardDestination">
                            <h4>{{ $t('earn.validate.reward.label') }}</h4>
                            <p class="desc">
                                {{ $t('earn.validate.reward.desc') }}
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
                            <!--                            <v-chip-group mandatory @change="rewardSelect">-->
                            <!--                                <v-chip small value="local">-->
                            <!--                                    {{ $t('earn.validate.reward.chip_1') }}-->
                            <!--                                </v-chip>-->
                            <!--                                <v-chip small value="custom">-->
                            <!--                                    {{ $t('earn.validate.reward.chip_2') }}-->
                            <!--                                </v-chip>-->
                            <!--                            </v-chip-group>-->
                            <QrInput
                                style="height: 40px; border-radius: 2px"
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
                        key="confirm"
                        v-show="isConfirm"
                        :node-i-d="nodeId"
                        :end="formEnd"
                        :amount="formAmt"
                        :delegation-fee="delegationFee"
                        :reward-address="rewardIn"
                        :reward-destination="rewardDestination"
                    ></ConfirmPage>
                </transition-group>
                <div>
                    <div class="summary" v-if="!isSuccess">
                        <CurrencySelect v-model="currency_type"></CurrencySelect>
                        <div>
                            <label>
                                {{ $t('earn.validate.summary.max_del') }}
                                <Tooltip
                                    style="display: inline-block"
                                    :text="$t('earn.validate.summary.max_del_tooltip')"
                                >
                                    <fa icon="question-circle"></fa>
                                </Tooltip>
                            </label>
                            <p v-if="currency_type === 'NATIVE'">
                                {{ maxDelegationText }} {{ nativeAssetSymbol }}
                            </p>
                            <p v-if="currency_type === 'USD'">${{ maxDelegationUsdText }} USD</p>
                        </div>
                        <div>
                            <label>{{ $t('earn.validate.summary.duration') }} *</label>
                            <p>{{ durationText }}</p>
                        </div>
                        <div>
                            <label>{{ $t('earn.validate.summary.rewards') }}</label>
                            <p v-if="currency_type === 'NATIVE'">
                                {{ estimatedReward.toLocaleString(2) }} {{ nativeAssetSymbol }}
                            </p>
                            <p v-if="currency_type === 'USD'">
                                ${{ estimatedRewardUSD.toLocaleString(2) }} USD
                            </p>
                        </div>
                        <div class="submit_box">
                            <label style="margin: 8px 0 !important">
                                * {{ $t('earn.validate.summary.warn') }}
                            </label>
                            <p v-if="warnShortDuration" class="err">
                                {{ $t('earn.validate.errs.duration_warn') }}
                            </p>
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
                                {{ $t('earn.validate.confirm') }}
                            </v-btn>
                            <template v-else>
                                <v-btn
                                    @click="submit"
                                    class="button_secondary"
                                    depressed
                                    :loading="isLoading"
                                    block
                                >
                                    {{ $t('earn.validate.submit') }}
                                </v-btn>
                                <v-btn
                                    text
                                    @click="cancelConfirm"
                                    block
                                    style="color: var(--primary-color); margin-top: 20px"
                                >
                                    {{ $t('earn.validate.cancel') }}
                                </v-btn>
                            </template>
                        </div>
                    </div>
                    <div class="success_cont" v-else>
                        <h2>{{ $t('earn.validate.success.title') }}</h2>
                        <p>{{ $t('earn.validate.success.desc') }}</p>
                        <p class="tx_id">Tx ID: {{ txId }}</p>
                        <div class="tx_status">
                            <div>
                                <label>{{ $t('earn.validate.success.status') }}</label>
                                <p v-if="!txStatus">Waiting..</p>
                                <p v-else>{{ txStatus }}</p>
                            </div>
                            <div class="status_icon">
                                <Spinner
                                    v-if="!txStatus"
                                    style="color: var(--primary-color)"
                                ></Spinner>
                                <p style="color: var(--success)" v-if="txStatus === 'Committed'">
                                    <fa icon="check-circle"></fa>
                                </p>
                                <p style="color: var(--error)" v-if="txStatus === 'Dropped'">
                                    <fa icon="times-circle"></fa>
                                </p>
                            </div>
                        </div>
                        <div class="reason_cont" v-if="txReason">
                            <label>{{ $t('earn.validate.success.reason') }}</label>
                            <p>{{ txReason }}</p>
                        </div>
                        <v-btn
                            @click="cancel"
                            block
                            class="button_secondary"
                            depressed
                            v-if="txStatus"
                        >
                            Back to Earn
                        </v-btn>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'
//@ts-ignore
import AvaxInput from '@/components/misc/AvaxInput.vue'
import { BN } from '@c4tplatform/camino'
import Big from 'big.js'
//@ts-ignore
import { QrInput } from '@c4tplatform/vue_components'
import { bintools, ava } from '@/AVA'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import ConfirmPage from '@/components/wallet/earn/Validate/ConfirmPage.vue'
import moment from 'moment'
import { bnToBig, calculateStakingReward } from '@/helpers/helper'
import Tooltip from '@/components/misc/Tooltip.vue'
import CurrencySelect from '@/components/misc/CurrencySelect/CurrencySelect.vue'
import Spinner from '@/components/misc/Spinner.vue'
import DateForm from '@/components/wallet/earn/DateForm.vue'
import UtxoSelectForm from '@/components/wallet/earn/UtxoSelectForm.vue'
import Expandable from '@/components/misc/Expandable.vue'
import { AmountOutput, UTXO } from '@c4tplatform/camino/dist/apis/platformvm'
import { WalletType } from '@/js/wallets/types'

const MIN_MS = 60000
const HOUR_MS = MIN_MS * 60
const DAY_MS = HOUR_MS * 24

const MIN_STAKE_DURATION = DAY_MS * 14
const MAX_STAKE_DURATION = DAY_MS * 365

@Component({
    name: 'add_validator',
    components: {
        Tooltip,
        AvaxInput,
        QrInput,
        ConfirmPage,
        CurrencySelect,
        Spinner,
        DateForm,
        Expandable,
        UtxoSelectForm,
    },
})
export default class AddValidator extends Vue {
    startDate: string = new Date(Date.now() + MIN_MS * 15).toISOString()
    endDate: string = new Date().toISOString()
    delegationFee: string = '2.0'
    nodeId = ''
    rewardIn: string = ''
    rewardDestination = 'local' // local || custom
    isLoading = false
    isConfirm = false
    err: string = ''
    stakeAmt: BN = new BN(0)

    minFee = 2

    formNodeId = ''
    formAmt: BN = new BN(0)
    formEnd: Date = new Date()
    formFee: number = 0
    formRewardAddr = ''
    formUtxos: UTXO[] = []

    txId = ''
    txStatus: string | null = null
    txReason: null | string = null

    isSuccess = false

    currency_type = 'NATIVE'

    mounted() {
        this.rewardSelect('local')
    }

    onFeeChange() {
        let num = parseFloat(this.delegationFee)
        if (num < this.minFee) {
            this.delegationFee = this.minFee.toString()
        } else if (num > 100) {
            this.delegationFee = '100'
        }
    }

    setEnd(val: string) {
        this.endDate = val
    }

    get rewardAddressLocal() {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet.getPlatformRewardAddress()
    }

    rewardSelect(val: 'local' | 'custom') {
        if (val === 'local') {
            this.rewardIn = this.rewardAddressLocal
        } else {
            this.rewardIn = ''
        }
        this.rewardDestination = val
    }

    // Returns true to show a warning about short validation periods that can not take any delegators
    get warnShortDuration(): boolean {
        let dur = this.stakeDuration

        // If duration is less than 16 days give a warning
        if (dur <= DAY_MS * 16) {
            return true
        }
        return false
    }

    get stakeDuration(): number {
        let start = new Date(this.startDate)
        let end = new Date(this.endDate)

        if (this.isConfirm) {
            end = this.formEnd
        }

        let diff = end.getTime() - start.getTime()
        return diff
    }

    get durationText() {
        let d = moment.duration(this.stakeDuration, 'milliseconds')
        let days = Math.floor(d.asDays())
        return `${days} days ${d.hours()} hours ${d.minutes()} minutes`
    }

    get denomination() {
        return 9
    }

    get platformUnlocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalance']
    }

    get platformLockedStakeable(): BN {
        return this.$store.getters['Assets/walletPlatformBalanceLockedStakeable']
    }

    get feeAmt(): BN {
        return ava.PChain().getTxFee()
    }

    get utxosBalance(): BN {
        return this.formUtxos.reduce((acc, val: UTXO) => {
            let out = val.getOutput() as AmountOutput
            return acc.add(out.getAmount())
        }, new BN(0))
    }

    get maxAmt(): BN {
        // let pAmt = this.platformUnlocked.add(this.platformLockedStakeable)
        let pAmt = this.utxosBalance
        // let fee = this.feeAmt;

        // absolute max stake
        let mult = new BN(10).pow(new BN(6 + 9))
        let absMaxStake = new BN(3).mul(mult)

        // If above stake limit
        if (pAmt.gt(absMaxStake)) {
            return absMaxStake
        }

        // let res = pAmt.sub(fee);
        const ZERO = new BN('0')
        if (pAmt.gt(ZERO)) {
            return pAmt
        } else {
            return ZERO
        }
    }

    get maxDelegationAmt(): BN {
        let stakeAmt = this.stakeAmt

        let maxRelative = stakeAmt.mul(new BN(5))

        // absolute max stake
        let mult = new BN(10).pow(new BN(6 + 9))
        let absMaxStake = new BN(3).mul(mult)

        let res
        if (maxRelative.lt(absMaxStake)) {
            res = maxRelative.sub(stakeAmt)
        } else {
            res = absMaxStake.sub(stakeAmt)
        }

        return BN.max(res, new BN(0))
    }

    get maxDelegationText() {
        return bnToBig(this.maxDelegationAmt, 9).toLocaleString(9)
    }

    get maxDelegationUsdText() {
        let big = bnToBig(this.maxDelegationAmt, 9)
        let res = big.times(this.avaxPrice)
        return res.toLocaleString(2)
    }

    get avaxPrice(): Big {
        return Big(this.$store.state.prices.usd)
    }

    get estimatedReward(): Big {
        let start = new Date(this.startDate)
        let end = new Date(this.endDate)
        let duration = end.getTime() - start.getTime() // in ms

        let currentSupply = this.$store.state.Platform.currentSupply
        let estimation = calculateStakingReward(this.stakeAmt, duration / 1000, currentSupply)
        let res = bnToBig(estimation, 9)

        return res
    }

    get estimatedRewardUSD() {
        return this.estimatedReward.times(this.avaxPrice)
    }

    updateFormData() {
        this.formNodeId = this.nodeId.trim()
        this.formAmt = this.stakeAmt
        this.formEnd = new Date(this.endDate)
        this.formRewardAddr = this.rewardIn
        this.formFee = parseFloat(this.delegationFee)
    }

    confirm() {
        if (!this.formCheck()) return
        this.updateFormData()
        this.isConfirm = true
    }
    cancelConfirm() {
        this.isConfirm = false
    }

    cancel() {
        this.$emit('cancel')
    }

    get canSubmit() {
        if (!this.nodeId) {
            return false
        }

        if (this.stakeAmt.isZero()) {
            return false
        }

        if (!this.rewardIn) {
            return false
        }

        return true
    }

    formCheck(): boolean {
        this.err = ''

        // Reward Address
        if (this.rewardDestination !== 'local') {
            let rewardAddr = this.rewardIn

            // If it doesnt start with P
            if (rewardAddr[0] !== 'P') {
                this.err = this.$t('earn.validate.errs.address') as string
                return false
            }

            // not a valid address
            try {
                bintools.stringToAddress(rewardAddr)
            } catch (e) {
                this.err = this.$t('earn.validate.errs.address') as string
                return false
            }
        }

        // Not a valid Node ID
        if (!this.nodeId.includes('NodeID-')) {
            this.err = this.$t('earn.validate.errs.id') as string
            return false
        }

        // Delegation Fee
        if (parseFloat(this.delegationFee) < this.minFee) {
            this.err = this.$t('earn.validate.errs.fee', [this.minFee]) as string
            return false
        }

        // Stake amount
        if (this.stakeAmt.lt(this.minStakeAmt)) {
            let big = Big(this.minStakeAmt.toString()).div(Math.pow(10, 9))
            this.err = this.$t('earn.validate.errs.amount', [big.toLocaleString()]) as string
            return false
        }

        return true
    }

    async submit() {
        if (!this.formCheck()) return
        let wallet: WalletType = this.$store.state.activeWallet

        // Start delegation in 5 minutes
        let startDate = new Date(Date.now() + 5 * MIN_MS)
        let endMs = this.formEnd.getTime()
        let startMs = startDate.getTime()

        // If End date - start date is greater than max stake duration, adjust start date
        if (endMs - startMs > MAX_STAKE_DURATION) {
            startDate = new Date(endMs - MAX_STAKE_DURATION)
        }

        try {
            this.isLoading = true
            this.err = ''
            let txId = await wallet.validate(
                this.formNodeId,
                this.formAmt,
                startDate,
                this.formEnd,
                this.formFee,
                this.formRewardAddr,
                this.formUtxos
            )
            this.isLoading = false
            this.onTxSubmit(txId)
        } catch (err) {
            this.isLoading = false
            this.onerror(err)
        }
    }

    onTxSubmit(txId: string) {
        this.txId = txId
        this.isSuccess = true
        this.updateTxStatus(txId)
    }

    onsuccess() {
        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Validator Added',
            message: 'Your tokens are now locked to stake.',
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
                this.onsuccess()
            }
        }
    }

    get minStakeAmt(): BN {
        return this.$store.state.Platform.minStake
    }

    onerror(err: any) {
        let msg: string = err.message
        console.error(err)

        if (msg.includes('startTime')) {
            this.err = this.$t('earn.validate.errs.date') as string
        } else if (msg.includes('must be at least')) {
            let minAmt = this.minStakeAmt
            let big = Big(minAmt.toString()).div(Math.pow(10, 9))
            this.err = this.$t('earn.validate.errs.amount', [big.toLocaleString()]) as string
        } else if (msg.includes('nodeID')) {
            this.err = this.$t('earn.validate.errs.id') as string
        } else if (msg.includes('address format')) {
            this.err = this.$t('earn.validate.errs.address') as string
        } else {
            this.err = err.message
        }

        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Validation Failed',
            message: 'Failed to add validator.',
        })
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';
.cols {
    /*display: grid;*/
    /*grid-template-columns: 1fr 1fr;*/
}

form {
    display: grid;
    grid-template-columns: 1fr 340px;
    column-gap: 90px;
}
.ins_col {
    max-width: 490px;
    padding-bottom: 8vh;
}
.amt {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px solid #999;
    padding: 4px 14px;
}
.bigIn {
    flex-grow: 1;
}

input {
    color: var(--primary-color);
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.desc {
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
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

.dates {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;

    label > span {
        float: right;
        opacity: 0.4;
        cursor: pointer;
        &:hover {
            opacity: 1;
        }
    }
}

.submit_box {
    .v-btn {
        margin-top: 14px;
    }
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

.reward_in {
    transition-duration: 0.2s;
    &[type='local'] {
        .reward_addr_in {
            opacity: 0.3;
            user-select: none;
            pointer-events: none;
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

@include main.mobile-device {
    form {
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
}
</style>
