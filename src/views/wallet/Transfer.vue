<template>
    <div class="transfer_card">
        <!--        <h1>{{ $t('transfer.title') }}</h1>-->
        <div v-if="networkStatus !== 'connected'" class="disconnected">
            <p>{{ $t('transfer.disconnected') }}</p>
        </div>
        <div class="card_body" v-else>
            <FormC v-show="formType === 'C'">
                <ChainInput v-model="formType" :disabled="isConfirm"></ChainInput>
            </FormC>
            <div class="new_order_Form" v-show="formType === 'X'">
                <div class="lists">
                    <ChainInput v-model="formType" :disabled="isConfirm"></ChainInput>
                    <div>
                        <tx-list
                            class="tx_list"
                            ref="txList"
                            @change="updateTxList"
                            :disabled="isConfirm"
                        ></tx-list>
                        <template v-if="hasNFT">
                            <NftList
                                @change="updateNftList"
                                ref="nftList"
                                :disabled="isConfirm"
                            ></NftList>
                        </template>
                    </div>
                </div>
                <div>
                    <div class="to_address">
                        <h4>{{ $t('transfer.to') }}</h4>
                        <qr-input
                            v-model="addressIn"
                            class="qrIn hover_border"
                            placeholder="xxx"
                            :disabled="isConfirm"
                        ></qr-input>
                    </div>
                    <div>
                        <!--                        <template v-if="isConfirm && formMemo.length > 0">-->
                        <!--                            <h4>Memo (Optional)</h4>-->
                        <!--                            <p class="confirm_val">{{ formMemo }}</p>-->
                        <!--                        </template>-->
                        <h4 v-if="memo || !isConfirm">{{ $t('transfer.memo') }}</h4>
                        <textarea
                            class="memo"
                            maxlength="256"
                            placeholder="Memo"
                            v-model="memo"
                            v-if="memo || !isConfirm"
                            :disabled="isConfirm"
                        ></textarea>
                    </div>
                    <div class="fees">
                        <p>
                            {{ $t('transfer.fee_tx') }}
                            <span>{{ txFee.toLocaleString(9) }} {{ nativeAssetSymbol }}</span>
                        </p>
                        <p>
                            {{ $t('transfer.total_native') }}
                            <span>{{ totalUSD.toLocaleString(2) }} USD</span>
                        </p>
                    </div>
                    <div class="checkout">
                        <ul class="err_list" v-if="formErrors.length > 0">
                            <li v-for="err in formErrors" :key="err">
                                {{ err }}
                            </li>
                        </ul>
                        <template v-if="!isConfirm">
                            <v-btn
                                depressed
                                class="button_primary"
                                :ripple="false"
                                @click="confirm"
                                :disabled="!canSend"
                                block
                            >
                                Confirm
                            </v-btn>
                        </template>
                        <template v-else-if="isConfirm && !isSuccess">
                            <p class="err">{{ err }}</p>
                            <v-btn
                                depressed
                                class="button_primary"
                                :loading="isAjax"
                                :ripple="false"
                                @click="submit"
                                :disabled="!canSend"
                                block
                            >
                                {{ $t('transfer.send') }}
                            </v-btn>
                            <v-btn
                                text
                                block
                                small
                                style="margin-top: 20px !important; color: var(--primary-color)"
                                @click="cancelConfirm"
                            >
                                {{ $t('misc.cancel') }}
                            </v-btn>
                        </template>
                        <template v-else-if="isSuccess">
                            <p style="color: var(--success)">
                                <fa icon="check-circle"></fa>
                                Transaction Sent
                            </p>
                            <label style="word-break: break-all">
                                <b>ID:</b>
                                {{ txId }}
                            </label>
                            <v-btn
                                depressed
                                style="margin-top: 14px"
                                class="button_primary"
                                :ripple="false"
                                @click="startAgain"
                                block
                                :disabled="!canSendAgain"
                            >
                                Start Again
                            </v-btn>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Ref } from 'vue-property-decorator'

import TxList from '@/components/wallet/transfer/TxList.vue'
import Big from 'big.js'

import NftList from '@/components/wallet/transfer/NftList.vue'

//@ts-ignore
import { QrInput } from '@c4tplatform/vue_components'
import { ava, isValidAddress } from '../../AVA'
import FaucetLink from '@/components/misc/FaucetLink.vue'
import { ITransaction } from '@/components/wallet/transfer/types'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
import { Buffer, BN } from '@c4tplatform/camino'
import TxSummary from '@/components/wallet/transfer/TxSummary.vue'
import { priceDict, IssueBatchTxInput } from '@/store/types'
import { WalletType } from '@/js/wallets/types'
import { bnToBig } from '@/helpers/helper'
import * as bip39 from 'bip39'
import FormC from '@/components/wallet/transfer/FormC.vue'
import { ChainIdType } from '@/constants'

import ChainInput from '@/components/wallet/transfer/ChainInput.vue'
import AvaAsset from '../../js/AvaAsset'
import { TxState } from '@/components/wallet/earn/ChainTransfer/types'
@Component({
    components: {
        FaucetLink,
        TxList,
        QrInput,
        NftList,
        TxSummary,
        FormC,
        ChainInput,
    },
})
export default class Transfer extends Vue {
    formType: ChainIdType = 'X'
    showAdvanced: boolean = false
    isAjax: boolean = false
    addressIn: string = ''
    memo: string = ''
    orders: ITransaction[] = []
    nftOrders: UTXO[] = []
    formErrors: string[] = []
    err = ''

    formAddress: string = ''
    formOrders: ITransaction[] = []
    formNftOrders: UTXO[] = []
    formMemo = ''

    isConfirm = false
    isSuccess = false
    txId = ''

    canSendAgain = false
    txState: TxState | null = null

    $refs!: {
        txList: TxList
        nftList: NftList
    }

    confirm() {
        let isValid = this.formCheck()
        if (!isValid) return

        this.formOrders = [...this.orders]
        this.formNftOrders = [...this.nftOrders]
        this.formAddress = this.addressIn
        this.formMemo = this.memo

        this.isConfirm = true
    }

    cancelConfirm() {
        this.err = ''
        this.formMemo = ''
        this.formOrders = []
        this.formNftOrders = []
        this.formAddress = ''
        this.isConfirm = false
    }

    updateTxList(data: ITransaction[]) {
        this.orders = data
    }

    updateNftList(val: UTXO[]) {
        this.nftOrders = val
    }

    formCheck() {
        this.formErrors = []
        let err = []

        let addr = this.addressIn

        let chain = addr.split('-')

        if (chain[0] !== 'X') {
            err.push('Invalid address. You can only send to other X addresses.')
        }

        if (!isValidAddress(addr)) {
            err.push('Invalid address.')
        }

        let memo = this.memo
        if (this.memo) {
            let buff = Buffer.from(memo)
            let size = buff.length
            if (size > 256) {
                err.push('You can have a maximum of 256 characters in your memo.')
            }

            // Make sure memo isnt mnemonic
            let isMnemonic = bip39.validateMnemonic(memo)
            if (isMnemonic) {
                err.push('You should not put a mnemonic phrase into the Memo field.')
            }
        }

        // Make sure to address matches the bech32 network hrp
        let hrp = ava.getHRP()
        if (!addr.includes(hrp)) {
            err.push('Not a valid address for this network.')
        }

        this.formErrors = err
        if (err.length === 0) {
            // this.send();
            return true
        } else {
            return false
        }
    }

    startAgain() {
        this.clearForm()

        this.txId = ''
        this.isSuccess = false
        this.cancelConfirm()

        this.orders = []
        this.nftOrders = []
        this.formOrders = []
        this.formNftOrders = []
    }

    clearForm() {
        this.addressIn = ''
        this.memo = ''

        // Clear transactions list
        this.$refs.txList.reset()

        // Clear NFT list
        if (this.hasNFT) {
            this.$refs.nftList.clear()
        }
    }

    async onsuccess(txId: string) {
        this.isAjax = false
        this.isSuccess = true

        this.$store.dispatch('Notifications/add', {
            title: this.$t('transfer.success_title'),
            message: this.$t('transfer.success_msg'),
            type: 'success',
        })

        // Update the user's balance
        this.$store.dispatch('Assets/updateUTXOs').then(() => {
            this.updateSendAgainLock()
        })
        this.$store.dispatch('History/updateTransactionHistory')
    }

    updateSendAgainLock() {
        if (!this.wallet.isFetchUtxos) {
            this.canSendAgain = true
        } else {
            setTimeout(() => {
                this.updateSendAgainLock()
            }, 1000)
        }
    }

    onerror(err: any) {
        this.err = err
        this.isAjax = false
        this.$store.dispatch('Notifications/add', {
            title: this.$t('transfer.error_title'),
            message: this.$t('transfer.error_msg'),
            type: 'error',
        })
    }

    submit() {
        this.isAjax = true
        this.err = ''

        let sumArray: (ITransaction | UTXO)[] = [...this.formOrders, ...this.formNftOrders]

        let txList: IssueBatchTxInput = {
            toAddress: this.formAddress,
            memo: Buffer.from(this.formMemo),
            orders: sumArray,
        }

        this.$store
            .dispatch('issueBatchTx', txList)
            .then((res) => {
                this.canSendAgain = false
                this.waitTxConfirm(res)
                this.txId = res
            })
            .catch((err) => {
                this.onerror(err)
            })
    }

    async waitTxConfirm(txId: string) {
        let status = await ava.XChain().getTxStatus(txId)
        if (status === 'Unknown' || status === 'Processing') {
            // if not confirmed ask again
            setTimeout(() => {
                this.waitTxConfirm(txId)
            }, 500)
            return false
        } else if (status === 'Dropped') {
            // If dropped stop the process
            this.txState = TxState.failed
            return false
        } else {
            // If success display success page
            this.txState = TxState.success
            this.onsuccess(txId)
        }
    }

    get networkStatus(): string {
        let stat = this.$store.state.Network.status
        return stat
    }

    get hasNFT(): boolean {
        // return this.$store.getters.walletNftUTXOs.length > 0
        return this.$store.state.Assets.nftUTXOs.length > 0
    }

    get faucetLink() {
        let link = process.env.VUE_APP_FAUCET_LINK
        if (link) return link
        return null
    }
    get canSend() {
        if (!this.addressIn) return false

        if (
            this.orders.length > 0 &&
            this.totalTxSize.eq(new BN(0)) &&
            this.nftOrders.length === 0
        ) {
            return false
        }

        if (this.orders.length === 0 && this.nftOrders.length === 0) return false

        return true
    }
    get totalTxSize() {
        let res = new BN(0)
        for (var i = 0; i < this.orders.length; i++) {
            let order = this.orders[i]
            if (order.amount) {
                res = res.add(this.orders[i].amount)
            }
        }

        return res
    }
    get avaxTxSize() {
        let res = new BN(0)
        for (var i = 0; i < this.orders.length; i++) {
            let order = this.orders[i]
            if (!order.asset) continue
            if (order.amount && order.asset.id === this.avaxAsset.id) {
                res = res.add(this.orders[i].amount)
            }
        }

        return res
    }
    get avaxAsset(): AvaAsset {
        return this.$store.getters['Assets/AssetAVA']
    }

    get wallet(): WalletType {
        return this.$store.state.activeWallet
    }

    get txFee(): Big {
        let fee = ava.XChain().getTxFee()
        return bnToBig(fee, 9)
    }

    get totalUSD(): Big {
        let totalAsset = this.avaxTxSize.add(ava.XChain().getTxFee())
        let bigAmt = bnToBig(totalAsset, 9)
        let usdPrice = this.priceDict.usd
        let usdBig = bigAmt.times(usdPrice)
        return usdBig
    }

    get addresses() {
        return this.$store.state.addresses
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }

    get nftUTXOs(): UTXO[] {
        return this.$store.state.Assets.nftUTXOs
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }

    deactivated() {
        this.startAgain()
    }

    activated() {
        this.clearForm()

        if (this.$route.query.chain) {
            let chain = this.$route.query.chain as string
            if (chain === 'X') {
                this.formType = 'X'
            } else {
                this.formType = 'C'
            }
        }

        if (this.$route.query.nft) {
            let utxoId = this.$route.query.nft as string
            let target = this.nftUTXOs.find((el) => {
                return el.getUTXOID() === utxoId
            })

            if (target) {
                this.$refs.nftList.addNft(target)
            }
        }
    }
}
</script>

<style lang="scss">
.advanced_panel {
    .v-expansion-panel-header {
        padding: 0;
        font-size: 12px;
        font-weight: normal;
        color: #2c3e50;
        min-height: auto !important;
        margin-bottom: 10px;
    }
    .v-expansion-panel-content__wrap {
        padding: 0 !important;
    }

    .v-icon {
        font-size: 12px;
    }
}
</style>
<style scoped lang="scss">
@use '../../styles/main';

$padLeft: 24px;
$padTop: 8px;

.disconnected {
    padding: 30px;
    text-align: center;
    background-color: var(--bg-light);
}

.explain {
    font-size: 12px;
    color: var(--primary-color-light);
}
h1 {
    font-weight: normal;
}
h4 {
    display: block;
    text-align: left;
    font-size: 12px;
    font-weight: bold;
    margin: 12px 0;
}

.send_to {
    display: flex;
    margin-bottom: 10px;
}

.addressIn >>> input {
    color: var(--bg) !important;
    padding: 5px 6px !important;
    text-align: center;
    letter-spacing: 2px;
    font-size: 12px;
}

.addressIn >>> input::-webkit-input-placeholder {
    color: var(--primary-color-light) !important;
}

.addressIn .v-input__slot:before {
    display: none;
}

.readerBut {
    margin-top: 4px;
    display: flex;
    background-color: #404040;
    /*cursor: pointer;*/
}
.readerBut button {
    opacity: 0.6;
    outline: none;
    padding: 6px 12px;
    margin: 0px auto;
}
.readerBut:hover button {
    opacity: 1;
}

.memo {
    font-size: 14px;
    background-color: var(--bg-light);
    resize: none;
    width: 100%;
    height: 80px;
    border-radius: var(--border-radius-sm);
    padding: 4px 12px;
}

.radio_buttons {
    margin-top: 15px;
}

.tx_info {
    text-align: left;
    font-size: 14px;
}

.new_order_Form {
    display: grid;
    grid-template-columns: 1fr 1fr 300px;
    column-gap: 45px;
}

.new_order_Form > div {
    /*padding: 10px 0;*/
    margin-bottom: 15px;
}
.lists {
    /*padding-right: 45px;*/
    border-right: 1px solid var(--bg-light);
    grid-column: 1/3;

    /*> div{*/
    /*    margin: 14px 0;*/
    /*}*/
}

.tx_list {
    margin-bottom: 14px;
}

.fees {
    margin: 14px 0;
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

label {
    color: var(--primary-color-light);
    font-size: 12px;
    font-weight: bold;
    margin: 2px 0 !important;
}

.faucet {
    margin-top: 20px;
}

.advanced {
    padding: 20px 0px !important;
    margin-bottom: 20px;
}

.advanced .advancedBody {
    transition-duration: 0.2s;
}

.err_list {
    font-size: 12px;
    color: var(--error);
    margin: 6px 0;
}

.checkout {
    margin-top: 14px;
}

.confirm_val {
    background-color: var(--bg-light);
    word-break: break-all;
    padding: 8px 16px;
}

//@media only screen and (max-width: 600px) {
//    .order_form {
//        display: block;
//    }
//    .asset_select button {
//        flex-grow: 1;
//        word-break: break-word;
//    }
//}

@include main.medium-device {
    .new_order_Form {
        grid-template-columns: 1fr 1fr 220px;
        column-gap: 25px;
    }
}

@include main.mobile-device {
    .transfer_card {
        display: block;
        grid-template-columns: none;
    }

    .but_primary {
        width: 100%;
    }

    .new_order_Form {
        display: block;
        grid-template-columns: none;
    }

    .tx_list {
        padding: 0;
        border: none;
    }

    .lists {
        border: none;
    }
}
</style>
