<template>
    <div class="chain_import">
        <h2>{{ $t('advanced.import.title') }}</h2>
        <p>{{ $t('advanced.import.desc') }}</p>
        <div v-if="isSuccess" class="is_success">
            <label>Tx ID</label>
            <p>{{ txId }}</p>
        </div>
        <p class="err" v-else-if="err">{{ err }}</p>
        <template v-if="!isLoading">
            <v-btn block class="button_secondary" depressed @click="atomicImportX" small>
                {{ $t('advanced.import.submit_x') }}
            </v-btn>
            <v-btn block class="button_secondary" depressed @click="atomicImportP" small>
                {{ $t('advanced.import.submit_p') }}
            </v-btn>
        </template>
        <Spinner class="spinner" v-else></Spinner>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import Spinner from '@/components/misc/Spinner.vue'
@Component({
    components: { Spinner },
})
export default class ChainImport extends Vue {
    err = ''
    isSuccess = false
    isLoading = false
    txId = ''

    get wallet(): null | AvaHdWallet | LedgerWallet {
        let wallet: null | AvaHdWallet | LedgerWallet = this.$store.state.activeWallet
        return wallet
    }
    async atomicImportX() {
        this.beforeSubmit()
        if (!this.wallet) return
        try {
            let txId = await this.wallet.importToXChain()
            this.onSuccess(txId)
        } catch (e) {
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
</style>
