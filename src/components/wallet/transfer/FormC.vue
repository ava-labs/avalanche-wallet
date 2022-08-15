<template>
    <div class="cols">
        <div class="form">
            <slot></slot>
            <div class="table_title">
                <p>{{ $t('transfer.tx_list.amount') }}</p>
                <p>{{ $t('transfer.tx_list.token') }}</p>
            </div>
            <div class="list_item">
                <EVMInputDropdown
                    @amountChange="onAmountChange"
                    @tokenChange="onTokenChange"
                    @collectibleChange="onCollectibleChange"
                    :disabled="isConfirm"
                    ref="token_in"
                    :gas-price="gasPrice"
                    :gas-limit="gasLimit"
                ></EVMInputDropdown>
            </div>
        </div>
        <div class="right_col">
            <div class="to_address">
                <h4>{{ $t('transfer.to') }}</h4>
                <qr-input
                    v-model="addressIn"
                    class="qrIn"
                    placeholder="xxx"
                    :disabled="isConfirm"
                ></qr-input>
            </div>
            <div class="gas_cont">
                <div>
                    <h4>
                        {{ $t('transfer.c_chain.gasPrice') }}
                        <br />
                        <small>Adjusted automatically according to network load.</small>
                    </h4>
                    <p></p>
                    <input
                        type="number"
                        v-model="gasPriceNumber"
                        min="0"
                        inputmode="numeric"
                        disabled
                    />
                </div>
                <div>
                    <h4>{{ $t('transfer.c_chain.gasLimit') }}</h4>
                    <template>
                        <p v-if="!isConfirm" style="font-size: 13px">
                            Gas Limit will be automatically calculated after you click Confirm.
                        </p>
                        <p v-else class="confirm_data">{{ gasLimit }}</p>
                    </template>
                </div>
            </div>

            <div class="fees" v-if="isConfirm">
                <p>
                    {{ $t('transfer.fee_tx') }}
                    <span>{{ maxFeeText }} {{ nativeAssetSymbol }}</span>
                </p>
                <p>
                    <span>${{ maxFeeUSD.toLocaleString(2) }} USD</span>
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
                        class="button_primary checkout"
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
import { priceDict } from '@/store/types'
import { WalletType } from '@/js/wallets/types'
import {
    GasHelper,
    TxHelper,
    bnToAvaxC,
    bnToBigAvaxC,
    bnToBigAvaxX,
} from '@c4tplatform/camino-wallet-sdk'

// @ts-ignore
import { QrInput } from '@c4tplatform/vue_components'
import Big from 'big.js'
import { BN } from '@c4tplatform/camino'
import { bnToBig } from '@/helpers/helper'
import { web3 } from '@/evm'
import EVMInputDropdown from '@/components/misc/EVMInputDropdown/EVMInputDropdown.vue'
import Erc20Token from '@/js/Erc20Token'
import { iERCNftSelectInput } from '@/components/misc/EVMInputDropdown/types'
import { WalletHelper } from '@/helpers/wallet_helper'

@Component({
    components: {
        EVMInputDropdown,
        AvaxInput,
        QrInput,
    },
})
export default class FormC extends Vue {
    isConfirm = false
    isSuccess = false
    addressIn = ''
    amountIn = new BN(0)
    gasPrice = new BN(225000000000)
    gasPriceInterval: NodeJS.Timeout | undefined = undefined
    gasLimit = 21000
    err = ''
    isLoading = false

    formAddress = ''
    formAmount = new BN(0)
    formToken: Erc20Token | 'native' = 'native'
    canSendAgain = false

    isCollectible = false
    formCollectible: iERCNftSelectInput | null = null

    txHash = ''

    $refs!: {
        token_in: EVMInputDropdown
    }

    created() {
        // Update gas price automatically
        this.updateGasPrice()
        this.gasPriceInterval = setInterval(() => {
            if (!this.isConfirm) {
                this.updateGasPrice()
            }
        }, 15000)
    }

    destroyed() {
        if (this.gasPriceInterval) {
            clearInterval(this.gasPriceInterval)
        }
    }

    get gasPriceNumber() {
        return bnToBigAvaxX(this.gasPrice).toFixed(0)
    }

    async updateGasPrice() {
        this.gasPrice = await GasHelper.getAdjustedGasPrice()
    }

    onAmountChange(val: BN) {
        this.amountIn = val
    }

    onTokenChange(token: Erc20Token | 'native') {
        this.formToken = token
        this.isCollectible = false
    }

    onCollectibleChange(val: iERCNftSelectInput) {
        this.isCollectible = true
        this.formCollectible = val
    }

    get wallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }

    get denomination(): number {
        if (this.formToken === 'native') {
            return 9
        } else {
            return parseInt(this.formToken.data.decimals as string)
        }
    }

    get symbol() {
        if (this.formToken === 'native') return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
        else return this.formToken.data.symbol
    }

    get totalUSD(): Big | null {
        if (this.formToken !== 'native') {
            return null
        }

        let bigAmt = bnToBig(this.amountIn, 18)
        let usdPrice = this.priceDict.usd
        let bigFee = bnToBig(this.maxFee, 18)
        let usdBig = bigAmt.add(bigFee).times(usdPrice)
        return usdBig
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
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
            this.err = 'Invalid C Chain address. Make sure your address begins with "0x" or "C-0x"'
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
        let res = this.gasPrice.mul(new BN(this.gasLimit))
        return res
    }

    get maxFeeUSD() {
        return bnToBigAvaxC(this.maxFee).times(this.priceDict.usd)
    }

    get maxFeeText(): string {
        return bnToAvaxC(this.maxFee)
    }

    // balance - (gas * price)
    // get maxAmt() {
    //     // let priceWei = new BN(this.gasPrice).mul(new BN(Math.pow(10, 9)))
    //     // let res = priceWei.mul(new BN(this.gasLimit))
    //     let res = this.rawBalance.sub(this.maxFee)
    //     return res.divRound(new BN(Math.pow(10, 9)))
    // }

    async estimateGas() {
        if (!this.wallet) return

        if (!this.isCollectible) {
            if (this.formToken === 'native') {
                // For native asset Transfers
                let gasLimit = await TxHelper.estimateAvaxGas(
                    this.wallet.getEvmAddress(),
                    this.formAddress,
                    this.formAmount,
                    this.gasPrice
                )
                this.gasLimit = gasLimit
            } else {
                // For ERC20 tokens
                let tx = (this.formToken as Erc20Token).createTransferTx(
                    this.formAddress,
                    this.formAmount
                )
                let estGas = await WalletHelper.estimateTxGas(this.wallet, tx)
                this.gasLimit = estGas
            }
        }

        // For ercNft transfers
        if (this.isCollectible && this.formCollectible) {
            let fromAddr = '0x' + this.wallet.getEvmAddress()
            let toAddr = this.formAddress
            let tx = this.formCollectible.token.createTransferTx(
                fromAddr,
                toAddr,
                this.formCollectible.id.tokenId
            )
            let estGas = await WalletHelper.estimateTxGas(this.wallet, tx)
            this.gasLimit = estGas
        }
    }

    confirm() {
        if (!this.wallet) return
        if (!this.validate()) return
        this.formAddress = this.addressIn
        this.formAmount = this.amountIn.clone()
        this.isConfirm = true

        this.estimateGas()
    }

    get formAmountBig() {
        return bnToBig(this.formAmount, this.denomination)
    }

    cancel() {
        this.err = ''
        this.isConfirm = false
    }

    startAgain() {
        this.isConfirm = false
        this.isSuccess = false
        this.err = ''

        this.$refs.token_in.clear()

        this.amountIn = new BN(0)
        this.gasLimit = 21000
        this.addressIn = ''
    }

    activated() {
        this.startAgain()

        let tokenAddr = this.$route.query.token as string
        let tokenId = this.$route.query.tokenId as string

        if (tokenAddr) {
            if (tokenAddr === 'native') {
                this.$refs.token_in.setToken(tokenAddr)
            } else {
                let token = this.$store.getters['Assets/findErc20'](tokenAddr)
                let ercNft = this.$store.getters['Assets/ERCNft/find'](tokenAddr)
                if (token) {
                    this.$refs.token_in.setToken(token)
                } else if (ercNft && tokenId) {
                    const quantity = this.$store.getters['Assets/ERCNft/owned'](tokenAddr, tokenId)
                    this.$refs.token_in.setERCNftToken(ercNft, { tokenId, quantity })
                }
            }
        }
    }

    get canConfirm() {
        if (!this.isCollectible) {
            if (this.amountIn.isZero()) return false
            if (this.gasLimit <= 0 && this.formToken == 'native') return false
        }

        // if (this.gasPrice <= 0) return false
        if (this.addressIn.length < 6) return false

        return true
    }

    async submit() {
        if (!this.wallet) return
        this.isLoading = true
        // convert base 9 to 18

        let gasPriceWei = this.gasPrice
        let toAddress = this.formAddress

        if (toAddress.substring(0, 2) === 'C-') {
            toAddress = toAddress.substring(2)
        }

        try {
            if (!this.isCollectible) {
                if (this.formToken === 'native') {
                    let formAmt = this.formAmount

                    let txHash = await this.wallet.sendEth(
                        toAddress,
                        formAmt,
                        gasPriceWei,
                        this.gasLimit
                    )
                    this.onSuccess(txHash)
                } else {
                    let txHash = await this.wallet.sendERC20(
                        toAddress,
                        this.formAmount,
                        gasPriceWei,
                        this.gasLimit,
                        this.formToken
                    )
                    this.onSuccess(txHash)
                }
            } else {
                if (!this.formCollectible) throw 'No collectible selected.'
                let txHash = await WalletHelper.sendERCNft(
                    this.wallet,
                    toAddress,
                    gasPriceWei,
                    this.gasLimit,
                    this.formCollectible.token,
                    this.formCollectible.id.tokenId
                )
                this.onSuccess(txHash)
            }
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

        console.error(err)

        this.$store.dispatch('Notifications/add', {
            title: this.$t('transfer.error_title'),
            message: this.$t('transfer.error_msg'),
            type: 'error',
        })
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

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
    padding-right: 60px;
    grid-column: 1/3;
    border-right: 1px solid var(--bg-light);
}

.list_item {
    margin-bottom: 12px;
}
.table_title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0;
    p {
        font-weight: bold;
        padding: 12px 0;
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
    display: flex;
    flex-direction: column;
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
