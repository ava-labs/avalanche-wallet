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
            <v-btn block class="button_secondary" depressed @click="atomicImportXFromP" small>
                {{ $t('advanced.import.submit_x') }}
            </v-btn>
            <v-btn block class="button_secondary" depressed @click="atomicImportXFromC" small>
                {{ $t('advanced.import.submit_c_x') }}
            </v-btn>
            <v-btn block class="button_secondary" depressed @click="atomicImportP" small>
                {{ $t('advanced.import.submit_p') }}
            </v-btn>
            <v-btn
                v-if="isEVMSupported"
                block
                class="button_secondary"
                depressed
                @click="atomicImportC"
                small
            >
                {{ $t('advanced.import.submit_c') }}
            </v-btn>
        </template>
        <Spinner class="spinner" v-else></Spinner>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Spinner from '@/components/misc/Spinner.vue'
import { WalletType } from '@/js/wallets/types'

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

    async atomicImportXFromP() {
        this.beforeSubmit()
        if (!this.wallet) return

        // Import from P
        try {
            let txId = await this.wallet.importToXChain('P')
            this.onSuccess(txId)
        } catch (e) {
            if (this.isSuccess) return
            this.onError(e)
        }
    }

    async atomicImportXFromC() {
        this.beforeSubmit()
        if (!this.wallet) return

        // // Import from C
        try {
            let txId = await this.wallet.importToXChain('C')
            this.onSuccess(txId)
        } catch (e) {
            if (this.isSuccess) return
            this.onError(e)
        }
    }

    async atomicImportP() {
        this.beforeSubmit()
        if (!this.wallet) return
        try {
            let txId = await this.wallet.importToPlatformChain()
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e)
        }
    }

    async atomicImportC() {
        this.beforeSubmit()
        if (!this.wallet) return
        try {
            let txId = await this.wallet.importToCChain()
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e)
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
