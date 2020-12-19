<template>
    <div>
        <div class="cols">
            <div class="form">
                <ChainSwapForm
                    @change="onFormChange"
                    :is-confirm="isConfirm"
                ></ChainSwapForm>

                <div v-if="!isSuccess && !isImportErr && !isLoading">
                    <div>
                        <label>{{ $t('earn.transfer.fee') }}</label>
                        <p style="font-size: 22px">{{ fee.toString() }} AVAX</p>
                    </div>
                    <div>
                        <p class="err">{{ err }}</p>
                        <!--                    <p v-if="maxAmt.isZero() && !isLoading" class="err">Insufficient funds to create the transactions.</p>-->
                        <v-btn
                            v-if="!isConfirm"
                            data-cy="confirm"
                            class="button_secondary"
                            @click="confirm"
                            :disabled="!canSubmit"
                            block
                            :loading="isLoading"
                            >{{ $t('earn.transfer.confirm') }}</v-btn
                        >
                        <template v-else>
                            <v-btn
                                data-cy="submit"
                                class="button_secondary"
                                @click="submit"
                                :loading="isLoading"
                                depressed
                                block
                                >{{ $t('earn.transfer.submit') }}</v-btn
                            >
                            <v-btn
                                v-if="!isLoading"
                                data-cy="cancel"
                                style="
                                    color: var(--primary-color);
                                    margin: 12px 0 !important;
                                "
                                @click="cancelConfirm"
                                depressed
                                text
                                block
                                >{{ $t('earn.transfer.cancel') }}</v-btn
                            >
                        </template>
                    </div>
                </div>
                <div v-if="isSuccess" class="complete">
                    <h4>{{ $t('earn.transfer.success.title') }}</h4>
                    <p style="color: var(--success); margin: 12px 0 !important">
                        <fa icon="check-circle"></fa>
                        {{ $t('earn.transfer.success.message') }}
                    </p>
                    <v-btn
                        depressed
                        class="button_primary"
                        small
                        @click="$emit('cancel')"
                        >{{ $t('earn.transfer.success.back') }}</v-btn
                    >
                </div>
            </div>
            <div class="right_col">
                <ChainCard :chain="sourceChain"></ChainCard>
                <ChainCard :chain="targetChain" :is-source="false"></ChainCard>
                <TxStateCard
                    :state="exportState"
                    :status="exportStatus"
                    :reason="exportReason"
                    :tx-id="exportId"
                ></TxStateCard>
                <TxStateCard
                    :state="importState"
                    :status="importStatus"
                    :reason="importReason"
                    :tx-id="importId"
                    :is-export="false"
                ></TxStateCard>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Dropdown from '@/components/misc/Dropdown.vue'
import AvaxInput from '@/components/misc/AvaxInput.vue'
import Big from 'big.js'
import AvaAsset from '@/js/AvaAsset'
import { BN } from 'avalanche'
import { pChain, avm, bintools } from '@/AVA'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { bnToBig } from '@/helpers/helper'
import Spinner from '@/components/misc/Spinner.vue'
import ChainCard from '@/components/wallet/earn/ChainTransfer/ChainCard.vue'
import TxStateCard from '@/components/wallet/earn/ChainTransfer/TxState.vue'
import {
    ChainSwapFormData,
    TxState,
} from '@/components/wallet/earn/ChainTransfer/types'
import { web3 } from '@/evm'
import { ChainIdType } from '@/constants'

import ChainSwapForm from '@/components/wallet/earn/ChainTransfer/Form.vue'

@Component({
    name: 'chain_transfer',
    components: {
        Spinner,
        Dropdown,
        AvaxInput,
        ChainCard,
        ChainSwapForm,
        TxStateCard,
    },
})
export default class ChainTransfer extends Vue {
    sourceChain: ChainIdType = 'X'
    targetChain: ChainIdType = 'P'
    isLoading = false
    amt: BN = new BN(0)
    err: string = ''

    isImportErr = false
    isConfirm = false
    isSuccess = false

    formAmt = new BN(0)

    // Transaction ids
    exportId: string = ''
    exportState: TxState = TxState.waiting
    exportStatus: string | null = null
    exportReason: string | null = null

    importId: string = ''
    importState: TxState = TxState.waiting
    importStatus: string | null = null
    importReason: string | null = null

    // switchChain() {
    //     let temp = this.sourceChain
    //     this.sourceChain = this.targetChain
    //     this.targetChain = temp
    // }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get platformUnlocked(): BN {
        return this.$store.getters.walletPlatformBalance
    }

    get platformLocked(): BN {
        return this.$store.getters.walletPlatformBalanceLocked
    }

    get avmUnlocked(): BN {
        if (!this.ava_asset) return new BN(0)
        return this.ava_asset.amount
    }

    get evmUnlocked(): BN {
        let balRaw = this.wallet.ethBalance
        return balRaw.divRound(new BN(Math.pow(10, 9)))
    }

    get balance(): Big {
        let bal: BN
        if (this.sourceChain === 'P') {
            bal = this.platformUnlocked
        } else if (this.sourceChain === 'C') {
            bal = this.evmUnlocked
        } else {
            bal = this.avmUnlocked
        }

        let bigBal = bnToBig(bal, 9)

        return bigBal
    }

    get formAmtText() {
        return bnToBig(this.formAmt, 9).toLocaleString()
    }
    // Fee is 2 times the tx transfer fee
    get fee(): Big {
        let feeX = avm.getTxFee()
        let totFee = feeX.mul(new BN(2))

        if (this.targetChain === 'C') {
            totFee = feeX
        }

        let feeXBig = bnToBig(totFee, 9)

        return feeXBig
    }

    get maxAmt(): BN {
        let max = this.balance.sub(this.fee)
        let zero = Big(0)
        if (zero.gt(max)) {
            return new BN(0)
        } else {
            let bnStr = max.times(Big(Math.pow(10, 9))).toString()
            return new BN(bnStr)
        }
    }

    get amtTotalCost(): Big {
        let amt = this.amtBig
        let fee = this.fee
        return amt.add(fee)
    }

    get amtBig(): Big {
        let bn = this.amt
        // let big = Big(bn.toString()).div(Math.pow(10,9));
        let big = bnToBig(bn, 9)
        return big
    }

    onFormChange(data: ChainSwapFormData) {
        this.amt = data.amount
        this.sourceChain = data.sourceChain
        this.targetChain = data.destinationChain
    }

    confirm() {
        this.formAmt = this.amt.clone()
        this.isConfirm = true
    }

    cancelConfirm() {
        this.isConfirm = false
        this.formAmt = new BN(0)
    }

    get wallet() {
        let wallet: AvaHdWallet = this.$store.state.activeWallet
        return wallet
    }

    async submit() {
        this.err = ''
        this.isLoading = true
        this.isImportErr = false

        try {
            this.chainExport(this.formAmt, this.sourceChain, this.targetChain)
        } catch (err) {
            this.onerror(err)
        }
    }

    // Triggers export from chain
    // STEP 1
    async chainExport(
        amt: BN,
        sourceChain: ChainIdType,
        destinationChain: ChainIdType
    ) {
        let wallet: AvaHdWallet = this.$store.state.activeWallet
        let exportTxId
        this.exportState = TxState.started

        exportTxId = await wallet.chainTransfer(
            amt,
            sourceChain,
            destinationChain
        )

        this.exportId = exportTxId
        this.waitExportStatus(exportTxId)
    }

    // STEP 2
    async waitExportStatus(txId: string) {
        let status
        if (this.sourceChain === 'X') {
            status = await avm.getTxStatus(txId)
        } else if (this.sourceChain === 'P') {
            let resp = await pChain.getTxStatus(txId)
            if (typeof resp === 'string') {
                status = resp
            } else {
                status = resp.status
                this.exportReason = resp.reason
            }
        } else {
            // TODO: Add C Chain waiting logic
            // let txIdHex = bintools.cb58Decode(txId).toString('hex')
            // let receipt = await web3.eth.getTransactionReceipt('0x' + txIdHex)
            // console.log(receipt)

            // if (receipt === null) {
            //     status = 'Unknown'
            // } else {
            //     console.log('check receipt status')
            //     status = 'success'
            // }
            status = 'success'
        }
        this.exportStatus = status

        if (status === 'Unknown' || status === 'Processing') {
            // if not confirmed ask again
            setTimeout(() => {
                this.waitExportStatus(txId)
            }, 1000)
            return false
        } else if (status === 'Dropped') {
            // If dropped stop the process
            this.exportState = TxState.failed
            return false
        } else {
            // If success start import
            this.exportState = TxState.success
            this.chainImport()
        }

        return true
    }

    // STEP 3
    async chainImport() {
        let wallet: AvaHdWallet = this.$store.state.activeWallet

        let importTxId
        try {
            if (this.targetChain === 'P') {
                importTxId = await wallet.importToPlatformChain()
            } else if (this.targetChain === 'X') {
                importTxId = await wallet.importToXChain(this.sourceChain)
            } else {
                importTxId = await wallet.importToCChain()
            }
        } catch (e) {
            this.onerror(e)
            return
        }

        this.importId = importTxId
        this.importState = TxState.started

        this.waitImportStatus(importTxId)
    }

    // STEP 4
    async waitImportStatus(txId: string) {
        let status

        if (this.targetChain === 'X') {
            status = await avm.getTxStatus(txId)
        } else if (this.targetChain === 'P') {
            let resp = await pChain.getTxStatus(txId)
            if (typeof resp === 'string') {
                status = resp
            } else {
                status = resp.status
            }
        } else {
            // TODO: Add evm processing
            status = 'success'
        }

        this.importStatus = status

        if (status === 'Unknown' || status === 'Processing') {
            // if not confirmed ask again
            setTimeout(() => {
                this.waitImportStatus(txId)
            }, 1000)
            return false
        } else if (status === 'Dropped') {
            // If dropped stop the process
            this.importState = TxState.failed
            return false
        } else {
            // If success display success page
            this.importState = TxState.success
            this.onsuccess()
        }

        return true
    }

    onerror(err: any) {
        console.error(err)
        this.isLoading = false
        this.err = err
        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Transfer Failed',
            message: err,
        })
    }

    onsuccess() {
        // Clear Form
        this.isSuccess = true
        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Transfer Complete',
            message: 'Funds transfered between chains.',
        })

        this.$store.dispatch('Assets/updateUTXOs')
    }

    get canSubmit() {
        if (this.amt.eq(new BN(0))) {
            return false
        }

        if (this.amt.gt(this.maxAmt)) {
            return false
        }

        return true
    }
}
</script>
<style scoped lang="scss">
@use "../../../../main";

.cols {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 5vw;
}

.right_col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 14px;
    row-gap: 14px;
    height: max-content;
    //height: 100%;
    > div {
        //height: max-content;
        background-color: var(--bg-light);
        border-radius: 4px;
        padding: 12px 18px;
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.1);
    }
}

.form {
    max-width: 100%;
    width: 360px;
    padding-bottom: 14px;
    //justify-self: center;
    > div {
        margin: 14px 0;
    }
}
.dropdown {
    background-color: var(--bg-light);
}

.chain {
    font-size: 32px;
    text-align: center;
    justify-content: center;
}
.chains {
    position: relative;
    //text-align: center;
    display: grid;
    grid-template-rows: max-content max-content;
    row-gap: 14px;
    //margin: 0 !important;
    //column-gap: 4px;
    //grid-template-columns: 1fr 1fr;
}

.chain_cont {
    background-color: var(--bg-light);
    padding: 14px;
}

.switch_but {
    position: absolute;
    left: 50%;
    border: 3px solid var(--bg-wallet-light);
    transform: translateX(-50%);
}

label {
    color: var(--primary-color-light);
}

.meta {
    display: grid;
    grid-template-columns: max-content max-content;
    column-gap: 2em;
}

h2 {
    font-weight: lighter;
    font-size: 2em;
}
.import_err {
    max-width: 320px;
    //margin: 10vh auto;
    color: var(--primary-color);

    p {
        margin: 6px 0 !important;
        margin-bottom: 14px !important;
        color: var(--primary-color-light);
    }
}

.loading_col {
    max-width: 320px;

    > div {
        position: relative;
        background-color: var(--bg-light);
        padding: 14px;
        margin-bottom: 6px;

        &[state='0'] {
            opacity: 0.2;
        }

        &[state='2'] {
            .status_icon {
                color: var(--success);
            }
        }

        &[state='-1'] {
            .status_icon {
                color: var(--error);
            }
        }

        p {
            word-break: break-all;
            font-size: 13px;
        }
    }

    label {
        font-weight: bold;
        font-size: 12px;
    }

    /*.status_icon{*/
    /*    position: absolute;*/
    /*    top: 8px;*/
    /*    right: 12px;*/
    /*}*/

    .loading_header {
        display: flex;
        justify-content: space-between;
    }

    .spinner {
        color: var(--primary-color) !important;
    }
}

.complete {
    margin-top: 30px;
    > div {
        background-color: var(--bg-light);
        padding: 14px;
        margin: 4px 0;
    }

    .desc {
        margin: 6px 0 !important;
        color: var(--primary-color-light);
    }

    p {
        word-break: keep-all !important;
    }
}

@include main.medium-device {
    .cols {
        //display: grid;
        //grid-template-columns: 1fr 2fr;
        grid-template-columns: none;
        //column-gap: 2vw;
    }
    .right_col {
        //grid-template-columns: 1fr 1fr;
        //row-gap: 14px;
        //display: none;
        grid-column: 1;
        grid-row: 1;
    }
}

@include main.mobile-device {
    .cols {
        display: block;
        padding-bottom: 3vh;
    }

    .chains {
        row-gap: 4px;
        grid-template-columns: none;
        grid-template-rows: max-content max-content;
    }
}
</style>
