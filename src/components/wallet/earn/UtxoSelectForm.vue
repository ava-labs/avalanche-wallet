<template>
    <div>
        <h4>{{ $t('earn.delegate.form.source.label') }}</h4>
        <p class="desc">
            {{ $t('earn.delegate.form.source.desc') }}
        </p>
        <v-chip-group @change="onTypeChange" v-model="formType" mandatory>
            <v-chip value="all" small>All</v-chip>
            <v-chip value="custom" small>Custom</v-chip>
        </v-chip-group>

        <div class="available">
            <div>
                <label>Available Balance</label>
                <p>
                    <span>{{ selectedBalanceText }} AVAX</span>
                </p>
            </div>

            <button
                @click="openModal"
                v-if="formType === 'custom'"
                class="select_but"
            >
                <fa icon="search"></fa> Select UTXOs
            </button>
        </div>

        <UtxoSelectModal
            ref="modal"
            v-model="customUtxos"
            :all="platformUtxos"
        ></UtxoSelectModal>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Model, Watch } from 'vue-property-decorator'
import UtxoSelectModal from '@/components/modals/UtxoSelect/UtxoSelect.vue'
import { AmountOutput, UTXO, UTXOSet } from 'avalanche/dist/apis/platformvm'
import { WalletType } from '@/store/types'
import { CurrencyType } from '@/components/misc/CurrencySelect/types'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'
@Component({
    components: {
        UtxoSelectModal,
    },
})
export default class UtxoSelectForm extends Vue {
    customUtxos: UTXO[] = []
    formType = 'all'
    @Model('change', { type: Array }) readonly utxos!: UTXO[]

    @Watch('customUtxos')
    onCustomChange(utxos: UTXO[]) {
        if (this.formType === 'custom') {
            this.$emit('change', utxos)
        }
    }

    onTypeChange(val: string) {
        if (val === 'all') {
            this.selectAll()
        } else {
            this.selectCustom()
        }
    }
    openModal() {
        //@ts-ignore
        this.$refs.modal.open()
    }
    selectCustom() {
        this.$emit('change', this.customUtxos)
    }

    selectAll() {
        this.$emit('change', this.platformUtxos)
    }

    mounted() {
        this.selectAll()
    }

    get platformUtxos(): UTXO[] {
        let wallet: WalletType | null = this.$store.state.activeWallet
        if (!wallet) return []
        return wallet.getPlatformUTXOSet().getAllUTXOs()
    }

    get selectedBalance(): BN {
        if (this.formType === 'all') {
            return this.platformUtxos.reduce((acc, val: UTXO) => {
                let out = val.getOutput() as AmountOutput
                return acc.add(out.getAmount())
            }, new BN(0))
        } else {
            return this.customUtxos.reduce((acc, val: UTXO) => {
                let out = val.getOutput() as AmountOutput
                return acc.add(out.getAmount())
            }, new BN(0))
        }
    }
    get selectedBalanceText() {
        return bnToBig(this.selectedBalance, 9).toLocaleString()
    }

    @Watch('platformUtxos')
    onPlatformUtxosChange(utxos: UTXO[]) {
        if (this.formType === 'all') {
            this.selectAll()
        }
    }
}
</script>
<style scoped lang="scss">
.available {
    max-width: 100%;
    padding: 6px 14px;
    background-color: var(--bg-light);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}
.select_but {
    font-size: 12px;
    color: var(--secondary-color);
    opacity: 0.7;
    &:hover {
        opacity: 1;
    }
}
</style>
