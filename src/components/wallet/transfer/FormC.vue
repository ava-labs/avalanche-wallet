<template>
    <div class="cols">
        <div class="form">
            <slot></slot>
            <div class="table_title">
                <p>{{ $t('transfer.tx_list.amount') }}</p>
                <p>{{ $t('transfer.tx_list.token') }}</p>
            </div>
            <AvaxInput
                :max="maxAmt"
                v-model="amountIn"
                disabled=""
                v-show="!isConfirm"
                :balance="balanceBig"
            ></AvaxInput>
            <p v-if="isConfirm" class="confirm_data" style="text-align: right">
                {{ formAmountBig.toLocaleString() }} AVAX
            </p>
        </div>
        <div class="right_col">
            <div class="to_address">
                <h4>{{ $t('transfer.to') }}</h4>
                <qr-input
                    v-show="!isConfirm"
                    v-model="addressIn"
                    class="qrIn"
                    placeholder="xxx"
                ></qr-input>
                <p v-if="isConfirm" class="confirm_data" style="word-break: break-all">
                    {{ formAddress }}
                </p>
            </div>
            <div class="gas_cont">
                <div>
                    <h4>{{ $t('transfer.c_chain.gasPrice') }}</h4>
                    <input type="number" v-model="gasPrice" min="0" v-if="!isConfirm" />
                    <p v-else class="confirm_data">{{ gasPrice }}</p>
                </div>
                <div>
                    <h4>{{ $t('transfer.c_chain.gasLimit') }}</h4>
                    <input type="number" v-model="gasLimit" min="0" v-if="!isConfirm" />
                    <p v-else class="confirm_data">{{ gasLimit }}</p>
                </div>
            </div>

            <div class="fees">
                <p>
                    {{ $t('transfer.fee_tx') }}
                    <span>{{ maxFeeText }} AVAX</span>
                </p>

                <p>
                    {{ $t('transfer.total') }}
                    <span>{{ totalUSD.toLocaleString(2) }} USD</span>
                </p>
            </div>
            <template v-if="!isSuccess">
                <p class="err">{{ err }}</p>
                <v-btn
                    class="button_primary checkout"
                    depressed
                    block
                    @click="confirm"
                    :disabled="!canConfirm"
                    v-if="!isConfirm"
                >
                    {{ $t('transfer.c_chain.confirm') }}
                </v-btn>
                <template v-else>
                    <v-btn
                        class="button_primary"
                        depressed
                        block
                        @click="submit"
                        :loading="isLoading"
                    >
                        {{ $t('transfer.send') }}
                    </v-btn>
                    <v-btn
                        class="checkout"
                        style="color: var(--primary-color)"
                        text
                        block
                        @click="cancel"
                        small
                    >
                        {{ $t('transfer.c_chain.cancel') }}
                    </v-btn>
                </template>
            </template>
            <template v-else>
                <p style="color: var(--success)">
                    <fa icon="check-circle"></fa>
                    {{ $t('transfer.c_chain.success.desc') }}
                </p>
                <div>
                    <label>{{ $t('transfer.c_chain.success.label1') }}</label>
                    <p class="confirm_data" style="word-break: break-all">
                        {{ txHash }}
                    </p>
                </div>
                <v-btn
                    style="margin: 14px 0"
                    :disabled="!canSendAgain"
                    class="button_primary"
                    small
                    block
                    @click="startAgain"
                >
                    {{ $t('transfer.c_chain.reset') }}
                </v-btn>
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import AvaxInput from '@/components/misc/AvaxInput.vue'
import { priceDict, WalletType } from '@/store/types'
// @ts-ignore
import { QrInput } from '@avalabs/vue_components'
import Big from 'big.js'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'
import { web3 } from '@/evm'

@Component({
    components: {
        AvaxInput,
        QrInput,
    },
})
export default class FormC extends Vue {
    isConfirm = false
    isSuccess = false
    addressIn = ''
    amountIn = new BN(0)
    gasPrice = 470
    gasLimit = 21000
    err = ''
    isLoading = false

    formAddress = ''
    formAmount = new BN(0)
    canSendAgain = false

    txHash = ''

    get wallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }
    get rawBalance(): BN {
        if (!this.wallet) return new BN(0)
        return this.wallet.ethBalance
    }
    get balance() {
        let bal = this.rawBalance
        return bal.divRound(new BN(Math.pow(10, 9).toString()))
    }

    get balanceBig() {
        return bnToBig(this.balance, 9)
    }

    get txFee() {
        return Big(3)
    }

    get totalUSD(): Big {
        let bigAmt = bnToBig(this.amountIn, 9)
        let usdPrice = this.priceDict.usd
        let bigFee = bnToBig(this.maxFee, 18)
        let usdBig = bigAmt.add(bigFee).times(usdPrice)
        return usdBig
    }

    validateAddress(addr: string) {
        if (addr.substring(0, 4) !== 'C-0x' && addr.substring(0, 2) !== '0x') {
            return false
        }

        return true
    }

    validate(): boolean {
        this.err = ''

        let addr = this.addressIn

        if (!this.validateAddress(addr)) {
            this.err = 'Invalid C Chain address. Make sure your address begins with "C-0x"'
            return false
        }

        if (addr.substring(0, 2) === 'C-') {
            let hexStr = addr.substring(2)
            if (!web3.utils.isAddress(hexStr)) {
                this.err = 'Not a valid C chain address.'
                return false
            }
        } else {
            if (!web3.utils.isAddress(addr)) {
                this.err = 'Not a valid C chain address.'
                return false
            }
        }

        return true
    }

    get maxFee(): BN {
        let priceWei = new BN(this.gasPrice).mul(new BN(Math.pow(10, 9)))
        let res = priceWei.mul(new BN(this.gasLimit))
        return res
    }

    get maxFeeText(): string {
        return bnToBig(this.maxFee, 18).toLocaleString()
    }

    // balance - (gas * price)
    get maxAmt() {
        // let priceWei = new BN(this.gasPrice).mul(new BN(Math.pow(10, 9)))
        // let res = priceWei.mul(new BN(this.gasLimit))
        let res = this.rawBalance.sub(this.maxFee)
        return res.divRound(new BN(Math.pow(10, 9)))
    }

    confirm() {
        if (!this.validate()) return
        this.formAddress = this.addressIn
        this.formAmount = this.amountIn.clone()
        this.isConfirm = true
    }

    get formAmountBig() {
        return bnToBig(this.formAmount, 9)
    }

    cancel() {
        this.err = ''
        this.isConfirm = false
    }

    startAgain() {
        this.isConfirm = false
        this.isSuccess = false
        this.err = ''

        this.amountIn = new BN(0)
        this.gasLimit = 21000
        this.gasPrice = 470
        this.addressIn = ''
    }

    activated() {
        this.startAgain()
    }

    get canConfirm() {
        if (this.amountIn.isZero()) return false
        if (this.addressIn.length < 6) return false
        if (this.gasPrice <= 0 || this.gasLimit <= 0) return false
        return true
    }

    async submit() {
        if (!this.wallet) return
        this.isLoading = true
        let formAmt = this.formAmount.mul(new BN(Math.pow(10, 9)))

        let gasPriceWei = new BN(this.gasPrice).mul(new BN(Math.pow(10, 9)))

        let toAddress = this.formAddress

        if (toAddress.substring(0, 2) === 'C-') {
            toAddress = toAddress.substring(2)
        }

        try {
            let txHash = await this.wallet.sendEth(toAddress, formAmt, gasPriceWei, this.gasLimit)
            this.onSuccess(txHash)
        } catch (e) {
            this.onError(e)
        }
    }

    onSuccess(txId: string) {
        this.isLoading = false
        this.isSuccess = true
        this.txHash = txId

        this.$store.dispatch('Notifications/add', {
            title: this.$t('transfer.success_title'),
            message: this.$t('transfer.success_msg'),
            type: 'success',
        })

        // Refresh UTXOs
        this.canSendAgain = false
        setTimeout(() => {
            this.$store.dispatch('Assets/updateUTXOs')
            this.$store.dispatch('History/updateTransactionHistory')
            this.canSendAgain = true
        }, 3000)
    }

    onError(err: any) {
        this.err = err
        this.isLoading = false

        this.$store.dispatch('Notifications/add', {
            title: this.$t('transfer.error_title'),
            message: this.$t('transfer.error_msg'),
            type: 'error',
        })
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

h4 {
    display: block;
    text-align: left;
    font-size: 12px;
    font-weight: bold;
    margin: 12px 0;
}

.cols {
    display: grid;
    grid-template-columns: 1fr 1fr 300px;
    column-gap: 45px;
    padding: 0;
}

.form {
    padding-right: 45px;
    grid-column: 1/3;
    border-right: 1px solid var(--bg-light);
    > div {
        margin-bottom: 12px;
    }
}

.table_title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    p {
        font-weight: bold;
    }
}

input,
.confirm_data {
    background-color: var(--bg-light);
    padding: 6px 12px;
    color: var(--primary-color);
    font-size: 14px;
}
.gas_cont {
    column-gap: 14px;
    input {
        width: 100%;
    }
}

label {
    color: var(--primary-color-light);
    font-size: 12px;
    font-weight: bold;
    margin: 2px 0 !important;
}

.fees {
    margin-top: 14px;
    border-top: 1px solid var(--bg-light);
    padding-top: 14px;
}
.fees p {
    text-align: left;
    font-size: 13px;
    color: var(--primary-color-light);
}

.fees span {
    float: right;
}
.to_address {
}

.checkout {
    margin-top: 14px;
}

.right_col {
    padding-bottom: 30px;
}

@include main.medium-device {
    .cols {
        grid-template-columns: 1fr 1fr 220px;
        column-gap: 25px;
    }
}

@include main.mobile-device {
    .cols {
        display: block;
    }
    .form {
        padding-bottom: 14px;
        border: none;
        padding-right: 0;
    }
    .gas_cont {
        display: block;

        > div {
            margin-bottom: 14px;
            display: flex;
            flex-direction: column;
        }
    }
}
</style>
