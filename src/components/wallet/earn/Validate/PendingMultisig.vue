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

        <div class="container">
            <div v-if="!!txDetails" class="transaction_details">
                <h4>Transaction details</h4>
                <div v-if="txDetails?.nodeId">
                    <label>{{ $t('earn.validate.confirmation.id') }}</label>
                    <p style="word-break: break-all">{{ txDetails?.nodeId }}</p>
                </div>
                <div v-if="txDetails?.amount">
                    <label>{{ $t('earn.validate.confirmation.amount') }}</label>
                    <p>{{ txDetails?.amount }} {{ nativeAssetSymbol }}</p>
                </div>
                <div v-if="txDetails?.expirationDate">
                    <label>{{ $t('earn.validate.confirmation.start') }}</label>
                    <p>{{ txDetails?.expirationDate }}</p>
                </div>
                <div v-if="txDetails?.endDate">
                    <label>{{ $t('earn.validate.confirmation.end') }}</label>
                    <p>{{ txDetails?.endDate }}</p>
                </div>
                <div v-if="txDetails?.expirationDate">
                    <label>{{ $t('earn.validate.confirmation.transaction_end') }}</label>
                    <p>{{ txDetails?.expirationDate }}</p>
                </div>
            </div>
            <div class="signatures">
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
                    <span v-else>
                        {{ $t('earn.validate.pending_multisig.execute_transaction') }}
                    </span>
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Spinner from '@/components/misc/Spinner.vue'
import { MultisigTx as SignavaultTx } from '@/store/modules/signavault/types'
import { MultisigWallet } from '@/js/wallets/MultisigWallet'
import { Buffer } from '@c4tplatform/caminojs/dist'
import { UnsignedTx, AddValidatorTx } from '@c4tplatform/caminojs/dist/apis/platformvm'
import Big from 'big.js'

@Component({
    components: {
        Spinner,
    },
})
export default class PendingMultisig extends Vue {
    @Prop() multisigTx!: SignavaultTx
    @Prop() nodeId!: string

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

    get txDetails() {
        let unsignedTx = new UnsignedTx()
        unsignedTx.fromBuffer(Buffer.from(this.multisigTx?.tx?.unsignedTx, 'hex'))
        const utx = unsignedTx.getTransaction()
        if (utx?.getTypeName() === 'CaminoAddValidatorTx') {
            const tx = utx as AddValidatorTx

            return {
                nodeId: this.nodeId,
                endDate: new Date(tx?.getEndTime()?.toNumber() * 1000).toLocaleString(),
                expirationDate: new Date(String(this.multisigTx.tx.expiration)).toLocaleString(),
                amount: Big(tx.getStakeAmount()?.toString()).div(Math.pow(10, 9)),
            }
        }

        return undefined
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
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

    refresh() {
        this.$emit('refresh')
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/abstracts/variables';
.container {
    display: flex;
    gap: 3rem;
}

.signatures {
    flex-basis: 65%;
    order: 1;
}
.transaction_details {
    flex-basis: 35%;
    order: 2;
    > div {
        background-color: var(--bg-light);
        margin: 14px 0;
        padding: 6px 14px;

        label {
            font-size: 14px;
            color: var(--primary-color-light);
        }
        p {
            font-size: 16px;
        }
    }

    .err {
        font-size: 14px;
    }
}
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