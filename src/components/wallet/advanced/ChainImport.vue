<template>
    <div class="chain_import">
        <h2>{{ $t('advanced.import.title') }}</h2>
        <p>{{ $t('advanced.import.desc') }}</p>
        <div v-if="isSuccess" class="is_success">
            <label>Tx ID</label>
            <p class="tx_id">{{ txId }}</p>
        </div>
        <p class="err" v-else-if="err">{{ err }}</p>
        <template v-if="!isLoading">
            <v-btn block class="button_secondary" depressed @click="atomicImportX('P')" small>
                Import X (From P)
            </v-btn>
            <v-btn block class="button_secondary" depressed @click="atomicImportX('C')" small>
                Import X (From C)
            </v-btn>
            <v-btn block class="button_secondary" depressed @click="atomicImportP('X')" small>
                Import P (From X)
            </v-btn>
            <v-btn block class="button_secondary" depressed @click="atomicImportP('C')" small>
                Import P (From C)
            </v-btn>
            <v-btn
                v-if="isEVMSupported"
                block
                class="button_secondary"
                depressed
                @click="atomicImportC('X')"
                small
            >
                Import C (from X)
            </v-btn>
            <v-btn block class="button_secondary" depressed @click="atomicImportC('P')" small>
                Import C (from P)
            </v-btn>
        </template>
        <Spinner class="spinner" v-else></Spinner>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

import Spinner from '@/components/misc/Spinner.vue'
import { WalletType } from '@/js/wallets/types'
import { BN } from '@c4tplatform/camino'
import {
    ExportChainsC,
    ExportChainsP,
    ExportChainsX,
    GasHelper,
    avaxCtoX,
} from '@c4tplatform/camino-wallet-sdk'

@Component({
    components: { Spinner },
})
export default class ChainImport extends Vue {
    err = ''
    isSuccess = false
    isLoading = false
    txId = ''

    get wallet(): null | WalletType {
        let wallet: null | WalletType = this.$store.state.activeWallet
        return wallet
    }

    get isEVMSupported() {
        if (!this.wallet) return false
        return this.wallet.ethAddress
    }

    async atomicImportX(sourceChain: ExportChainsX) {
        this.beforeSubmit()
        if (!this.wallet) return

        // // Import from C
        try {
            let txId = await this.wallet.importToXChain(sourceChain)
            this.onSuccess(txId)
        } catch (e) {
            if (this.isSuccess) return
            this.onError(e as Error)
        }
    }

    async atomicImportP(source: ExportChainsP) {
        this.beforeSubmit()
        if (!this.wallet) return
        try {
            let txId = await this.wallet.importToPlatformChain(source)
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e as Error)
        }
    }

    async atomicImportC(source: ExportChainsC) {
        this.beforeSubmit()
        if (!this.wallet) return
        try {
            const utxoSet = await this.wallet.evmGetAtomicUTXOs(source)
            const utxos = utxoSet.getAllUTXOs()

            const numIns = utxos.length
            const baseFee = await GasHelper.getBaseFeeRecommended()

            if (numIns === 0) {
                throw new Error('Nothing to import.')
            }

            // Calculate number of signatures
            const numSigs = utxos.reduce((acc, utxo) => {
                return acc + utxo.getOutput().getAddresses().length
            }, 0)

            const gas = GasHelper.estimateImportGasFeeFromMockTx(numIns, numSigs)

            const totFee = baseFee.mul(new BN(gas))
            let txId = await this.wallet.importToCChain(source, avaxCtoX(totFee))
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e as Error)
        }
    }

    deactivated() {
        this.err = ''
        this.txId = ''
        this.isSuccess = false
    }

    beforeSubmit() {
        this.isLoading = true
        this.err = ''
        this.isSuccess = false
        this.txId = ''
    }

    onSuccess(txId: string) {
        this.isLoading = false
        this.err = ''
        this.isSuccess = true
        this.txId = txId

        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Import Success',
            message: txId,
        })

        setTimeout(() => {
            this.$store.dispatch('Assets/updateUTXOs')
            this.$store.dispatch('History/updateTransactionHistory')
        }, 3000)
    }

    onError(err: Error) {
        this.isLoading = false
        let msg = ''
        if (err.message.includes('No atomic')) {
            this.err = 'Nothing found to import.'
            return
        } else {
            this.err = err.message
        }
    }
}
</script>
<style scoped lang="scss">
.v-btn {
    margin: 8px 0;
}

.is_success {
    label {
        color: var(--primary-color-light);
    }
}

.spinner {
    color: var(--primary-color) !important;
    margin: 14px auto !important;
}

.tx_id {
    font-size: 13px;
    word-break: break-all;
}
</style>
