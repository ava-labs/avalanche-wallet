<template>
    <div>
        <div class="cols">
            <div class="form">
                <div class="chains">
                    <div class="chain_cont">
                        <label>{{ $t('earn.transfer.source') }}</label>
                        <p class="chain">{{ sourceChain }}</p>
                        <div class="chain_info">
                            <label>{{ $t('earn.transfer.balance') }}</label>
                            <p>{{ balance.toLocaleString() }} AVAX</p>
                        </div>
                    </div>
                    <v-btn
                        icon
                        style="align-self: center"
                        class="switch_but button_primary"
                        @click="switchChain"
                        v-if="!isConfirm"
                    >
                        <fa icon="sync"></fa>
                    </v-btn>
                    <div class="chain_cont">
                        <label>{{ $t('earn.transfer.destination') }}</label>
                        <p class="chain">{{ targetChain }}</p>
                        <div class="chain_info">
                            <label>{{ $t('earn.transfer.balance') }}</label>
                            <p>
                                {{ destinationBalance.toLocaleString() }} AVAX
                            </p>
                        </div>
                    </div>
                </div>
                <div v-show="!isConfirm">
                    <label>{{ $t('earn.transfer.amount') }}</label>
                    <AvaxInput :max="maxAmt" v-model="amt"></AvaxInput>
                </div>
                <div class="confirmation_val" v-if="isConfirm">
                    <label>{{ $t('earn.transfer.amount') }}</label>
                    <p>{{ formAmtText }} AVAX</p>
                </div>
            </div>
            <div class="right_col">
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
                            :loading="isLoading"
                            block
                            >{{ $t('earn.transfer.confirm') }}</v-btn
                        >
                        <template v-else>
                            <v-btn
                                data-cy="submit"
                                class="button_secondary"
                                @click="submit"
                                :loading="isLoading"
                                block
                                depressed
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
                                block
                                depressed
                                text
                                >{{ $t('earn.transfer.cancel') }}</v-btn
                            >
                        </template>
                    </div>
                </div>
                <div v-else-if="isLoading" class="loading_col">
                    <div :state="exportState">
                        <div class="loading_header">
                            <h4>Export</h4>
                            <div class="status_icon">
                                <Spinner
                                    v-if="exportState == 1"
                                    class="spinner"
                                ></Spinner>
                                <p v-else-if="exportState === 2">
                                    <fa icon="check-circle"></fa>
                                </p>
                                <p v-else-if="exportState === -1">
                                    <fa icon="times-circle"></fa>
                                </p>
                            </div>
                        </div>
                        <label>ID</label>
                        <p>{{ exportId || '-' }}</p>
                        <label>Status</label>
                        <p v-if="!exportStatus">Not started</p>
                        <p v-else>{{ exportStatus }}</p>
                        <template v-if="exportReason">
                            <label>Reason</label>
                            <p>{{ exportReason }}</p>
                        </template>
                    </div>
                    <div :state="importState">
                        <div class="loading_header">
                            <h4>Import</h4>
                            <div class="status_icon">
                                <Spinner
                                    v-if="importState == 1"
                                    class="spinner"
                                ></Spinner>
                                <p v-else-if="importState === 2">
                                    <fa icon="check-circle"></fa>
                                </p>
                                <p v-else-if="importState === -1">
                                    <fa icon="times-circle"></fa>
                                </p>
                            </div>
                        </div>
                        <label>ID</label>
                        <p>{{ importId || '-' }}</p>
                        <label>Status</label>
                        <p v-if="!importStatus">Not started</p>
                        <p v-else>{{ importStatus }}</p>
                        <template v-if="importReason">
                            <label>Reason</label>
                            <p>{{ importReason }}</p>
                        </template>
                    </div>
                    <div v-if="isSuccess" class="complete">
                        <h4>{{ $t('earn.transfer.success.title') }}</h4>
                        <p
                            style="
                                color: var(--success);
                                margin: 12px 0 !important;
                            "
                        >
                            <fa icon="check-circle"></fa>
                            {{ $t('earn.transfer.success.message') }}
                        </p>
                        <v-btn
                            depressed
                            class="button_primary"
                            small
                            @click="$emit('cancel')"
                            block
                            >{{ $t('earn.transfer.success.back') }}</v-btn
                        >
                    </div>
                </div>
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
import { pChain, avm } from '@/AVA'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { bnToBig } from '@/helpers/helper'
import Spinner from '@/components/misc/Spinner.vue'

enum TxState {
    failed = -1,
    waiting = 0,
    started = 1,
    success = 2,
}

@Component({
    name: 'chain_transfer',
    components: {
        Spinner,
        Dropdown,
        AvaxInput,
    },
})
export default class ChainTransfer extends Vue {
    sourceChain = 'X'
    targetChain = 'P'
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

    switchChain() {
        let temp = this.sourceChain
        this.sourceChain = this.targetChain
        this.targetChain = temp
    }

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

    get balance(): Big {
        let bal: BN
        if (this.sourceChain === 'P') {
            bal = this.platformUnlocked
        } else {
            bal = this.avmUnlocked
        }

        // let bigBal = Big(bal.toString())
        //     bigBal = bigBal.div(Math.pow(10,9))
        let bigBal = bnToBig(bal, 9)

        return bigBal
    }

    get destinationBalance(): Big {
        let bal: BN
        if (this.sourceChain === 'P') {
            bal = this.avmUnlocked
        } else {
            bal = this.platformUnlocked
        }

        let bigBal = bnToBig(bal, 9)
        // let bigBal = Big(bal.toString())
        // bigBal = bigBal.div(Math.pow(10,9))
        return bigBal
    }

    get formAmtText() {
        return bnToBig(this.formAmt, 9).toLocaleString()
    }
    // Fee is 2 times the tx transfer fee
    get fee(): Big {
        let feeP = pChain.getTxFee()
        let feeX = avm.getTxFee()

        // let totFee = feeP.add(feeX);
        let totFee = feeX.mul(new BN(2))
        // let feePBig = Big(feeP.toString()).div(Math.pow(10,9));
        // let feeXBig = Big(feeX.toString()).div(Math.pow(10,9));
        // let feeXBig = Big(totFee.toString()).div(Math.pow(10,9));
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
            this.chainExport(this.formAmt, this.sourceChain)
        } catch (err) {
            this.onerror(err)
        }
    }

    // Triggers export from chain
    // STEP 1
    async chainExport(amt: BN, sourceChain: string) {
        let wallet: AvaHdWallet = this.$store.state.activeWallet
        let exportTxId
        this.exportState = TxState.started

        exportTxId = await wallet.chainTransfer(amt, sourceChain)

        this.exportId = exportTxId
        this.waitExportStatus(exportTxId)
    }

    // STEP 2
    async waitExportStatus(txId: string) {
        let status
        if (this.sourceChain === 'X') {
            status = await avm.getTxStatus(txId)
        } else {
            let resp = await pChain.getTxStatus(txId)
            if (typeof resp === 'string') {
                status = resp
            } else {
                status = resp.status
                this.exportReason = resp.reason
            }
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
        if (this.sourceChain === 'X') {
            importTxId = await wallet.importToPlatformChain()
        } else {
            importTxId = await wallet.importToXChain()
        }
        this.importId = importTxId
        this.importState = TxState.started

        this.waitImportStatus(importTxId)
    }

    // STEP 4
    async waitImportStatus(txId: string) {
        let status

        if (this.sourceChain === 'P') {
            status = await avm.getTxStatus(txId)
        } else {
            let resp = await pChain.getTxStatus(txId)
            if (typeof resp === 'string') {
                status = resp
            } else {
                status = resp.status
            }
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
@use "../../../main";

.cols {
    display: grid;
    grid-template-columns: 1fr 340px;
    column-gap: 2vw;
}

.right_col {
}

.confirmation_val {
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.form {
    justify-self: center;
    //margin: 30px auto;
    width: 100%;
    //max-width: 540px;
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
    text-align: center;
    display: grid;
    margin: 0 !important;
    column-gap: 4px;
    grid-template-columns: 1fr 1fr;
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
