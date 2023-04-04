<template>
    <div style="word-break: break-all">
        <div class="refresh_div">
            <div class="refresh">
                <Spinner v-if="loading" class="spinner"></Spinner>
                <button v-else @click="refresh">
                    <v-icon>mdi-refresh</v-icon>
                </button>
            </div>
        </div>
        <div class="signer_row" v-for="owner in txOwners" :key="owner.address">
            <fa v-if="!!owner.signature" class="success_status" icon="check-circle"></fa>
            <div v-else class="dashed_circle"></div>
            <div>
                <p class="body_text">{{ owner.address }}</p>
                <p v-if="!!owner.signature" class="success_status">
                    ({{ $t('earn.validate.pending_multisig.signed') }})
                </p>
                <p v-else class="pending_status">
                    ({{ $t('earn.validate.pending_multisig.pending') }})
                </p>
            </div>

            <v-btn
                v-if="!Boolean(owner?.signature) && isMyWallet(owner?.address)"
                class="button_secondary"
                @click="sign"
                :loading="loadingSigning"
                depressed
            >
                {{ $t('earn.validate.pending_multisig.sign') }}
            </v-btn>
        </div>

        <h4 class="mt2">
            {{
                $t('earn.validate.pending_multisig.threshold', {
                    value: sigValue,
                    threshold: multisigTx?.tx.threshold,
                })
            }}
        </h4>

        <v-btn @click="issue" class="button_secondary mt2" depressed block>
            <Spinner v-if="loadingIssue" class="spinner"></Spinner>
            <span v-else>{{ $t('earn.validate.pending_multisig.execute_transaction') }}</span>
        </v-btn>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Spinner from '@/components/misc/Spinner.vue'
import { MultisigTx as SignavaultTx } from '@/store/modules/signavault/types'
import { MultisigWallet } from '@/js/wallets/MultisigWallet'

@Component({
    components: {
        Spinner,
    },
})
export default class PendingMultisig extends Vue {
    @Prop() multisigTx!: SignavaultTx

    helpers = this.globalHelper()
    loading = false
    loadingSigning = false
    loadingIssue = false

    get sigValue() {
        return this.multisigTx?.tx.owners?.filter((owner) => !!owner.signature)?.length
    }

    get txOwners() {
        return this.multisigTx?.tx?.owners ?? []
    }

    get activeWallet(): MultisigWallet {
        return this.$store.state.activeWallet
    }

    get txState(): number {
        return this.multisigTx?.state ?? -1
    }

    async sign() {
        const wallet = this.activeWallet
        if (!wallet || !(wallet instanceof MultisigWallet))
            return console.debug('MultiSigTx::sign: Invalid wallet')
        if (!this.multisigTx) return console.debug('MultiSigTx::sign: Invalid Tx')
        this.loadingSigning = true
        try {
            await wallet.addSignatures(this.multisigTx?.tx)
            this.helpers.dispatchNotification({
                message: 'Your signature saved successfully!',
                type: 'success',
            })
            this.$store.dispatch('Signavault/updateTransaction')
        } catch (e: any) {
            this.helpers.dispatchNotification({
                message: 'Your signature is not saved.',
                type: 'error',
            })
        } finally {
            this.loadingSigning = false
        }
    }

    async issue() {
        const wallet = this.activeWallet
        if (!wallet || !(wallet instanceof MultisigWallet))
            return console.log('MultiSigTx::sign: Invalid wallet')
        if (!this.multisigTx) return console.log('MultiSigTx::sign: Invalid Tx')
        this.loadingIssue = true
        try {
            await wallet.issueExternal(this.multisigTx?.tx)
            this.helpers.dispatchNotification({
                message: this.$t('notifications.register_node_success'),
                type: 'success',
            })
            this.$store.dispatch('Signavault/updateTransaction')
            this.$emit('issued', 'issued')
        } catch (e: any) {
            console.log(e)
            this.helpers.dispatchNotification({
                message: this.$t('notifications.execute_multisig_transaction_error'),
                type: 'error',
            })
        }
        this.loadingIssue = false
    }

    isMyWallet(pAddress: string): boolean {
        return !!this.activeWallet.wallets.find((w) => w?.getAllAddressesP()?.[0] === pAddress)
    }
    created() {
        console.log(this.activeWallet.wallets)
    }

    refresh() {
        this.$emit('refresh')
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/abstracts/variables';
.dashed_circle {
    min-height: 20px;
    min-width: 20px;
    background-color: transparent;
    border-radius: 50%;
    border: 3px dashed;
    border-color: var(--warning);
}
.signer_row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}
.success_status {
    color: var(--success);
}

.pending_status {
    color: var(--warning);
}
.refresh {
    width: 20px;
    height: 20px;
    .v-icon {
        color: var(--primary-color);
    }

    button {
        outline: none !important;
    }
    img {
        object-fit: contain;
        width: 100%;
    }

    .spinner {
        color: var(--primary-color) !important;
    }
}

.refresh_div {
    position: relative;
    float: right;
    margin-top: -5%;
}
.body_text {
    word-break: break-all;
}
.mt2 {
    margin-top: 2rem;
}
</style>