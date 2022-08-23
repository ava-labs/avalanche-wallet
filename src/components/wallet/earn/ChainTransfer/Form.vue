<template>
    <div class="swap_form">
        <div>
            <label>{{ $t('cross_chain.form.source') }}</label>
            <select @input="onChangeSource" class="hover_border" v-model="sourceChain">
                <option
                    v-for="option in sourceOptions"
                    :value="option"
                    :key="option"
                    :disabled="isConfirm"
                >
                    {{ chainNames[option] }}
                </option>
            </select>
        </div>
        <div>
            <label>{{ $t('cross_chain.form.destination') }}</label>
            <p class="ledger_warn" v-if="!isEVMSupported">
                C Chain is currently not supported on Ledger devices.
            </p>
            <select @input="onChangeDestination" class="hover_border" v-model="targetChain">
                <option
                    v-for="option in destinationOptions"
                    :value="option"
                    :key="option"
                    :disabled="isConfirm"
                >
                    {{ chainNames[option] }}
                </option>
            </select>
        </div>

        <div v-if="!isConfirm">
            <label>{{ $t('earn.transfer.amount') }}</label>

            <AvaxInput
                :max="maxAmt"
                v-model="amt"
                @change="onAmtChange"
                :balance="balance"
            ></AvaxInput>
        </div>
        <div class="confirmation_val" v-else>
            <label>{{ $t('earn.transfer.amount') }}</label>
            <p>{{ formAmtText }} {{ nativeAssetSymbol }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import AvaxInput from '@/components/misc/AvaxInput.vue'
import { BN } from '@c4tplatform/camino'
import Big from 'big.js'
import { bnToBig } from '@/helpers/helper'
import { ChainIdType } from '@/constants'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { ChainSwapFormData } from '@/components/wallet/earn/ChainTransfer/types'

const chainTypes: ChainIdType[] = ['X', 'P', 'C']
const chainNames = {
    X: 'X Chain',
    C: 'C Chain',
    P: 'P Chain',
}

@Component({
    components: {
        AvaxInput,
    },
})
export default class Form extends Vue {
    sourceChain: ChainIdType = 'X'
    targetChain: ChainIdType = 'P'
    amt: BN = new BN(0)

    @Prop() balance!: Big
    @Prop() maxAmt!: BN
    @Prop() isConfirm!: boolean

    clear() {
        this.amt = new BN(0)
        this.onChange()
    }

    get chainNames() {
        return chainNames
    }

    get formAmtText() {
        return bnToBig(this.amt, 9).toLocaleString()
    }

    get sourceOptions(): ChainIdType[] {
        if (!this.isEVMSupported) {
            return ['X', 'P']
        }

        let all = [...chainTypes]
        return all
    }

    get destinationOptions(): ChainIdType[] {
        return {
            X: ['P', 'C'],
            P: ['X', 'C'],
            C: ['X', 'P'],
        }[this.sourceChain] as ChainIdType[]
    }

    @Watch('destinationOptions')
    onDestinationsChange() {
        this.targetChain = this.destinationOptions[0]
        this.onChange()
    }

    get wallet() {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet
    }

    get isEVMSupported() {
        return this.wallet.ethAddress
    }

    get nativeAssetSymbol() {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }

    onChangeSource(ev: any) {
        let val: ChainIdType = ev.target.value
        this.sourceChain = val
        this.onChange()
    }

    onChangeDestination(ev: any) {
        let val: ChainIdType = ev.target.value
        this.targetChain = val
        this.onChange()
    }

    onAmtChange() {
        this.onChange()
    }

    onChange() {
        let data: ChainSwapFormData = {
            sourceChain: this.sourceChain,
            destinationChain: this.targetChain,
            amount: this.amt,
        }
        this.$emit('change', data)
    }

    mounted() {
        this.onChange()
    }
}
</script>
<style scoped lang="scss">
.swap_form {
    > div {
        flex-direction: column;
        display: flex;
        margin: 13px 0;
    }

    padding-bottom: 14px;
}
label {
    color: var(--primary-color);
    font-size: 15px;
    font-weight: bold;
    font-family: Roboto, sans-serif;
    margin-bottom: 4px !important;
}

select {
    width: 100%;
    color: var(--primary-color);
    background-color: var(--bg-light);
    border: 1px solid transparent;
    border-radius: var(--border-radius-sm);
    padding: 16px 12px;
    font-size: 14px;
    outline: none;
    transition-duration: 0.1s;
    cursor: pointer;

    //&:hover {
    //    border-color: var(--primary-color-light);
    //}
    //
    //&:focus {
    //    border-color: var(--secondary-color);
    //}
}

.balance {
    font-size: 13px;
    color: var(--primary-color-light);
    span {
        float: right;
    }
    margin-top: 4px !important;
}

.confirmation_val {
    p {
        padding: 6px 12px;
        text-align: right;
        background-color: var(--bg-light);
    }
}

.ledger_warn {
    color: var(--info);
    font-size: 13px;
    margin-bottom: 4px !important;
}
</style>
