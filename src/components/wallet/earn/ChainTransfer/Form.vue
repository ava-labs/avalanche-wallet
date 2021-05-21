<template>
    <div class="swap_form">
        <div>
            <label>{{ $t('cross_chain.form.source') }}</label>
            <select @input="onChangeSource" class="hover_border">
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
            <select @input="onChangeDestination" class="hover_border">
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
            <p>{{ formAmtText }} AVAX</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import AvaxInput from '@/components/misc/AvaxInput.vue'
import { BN } from 'avalanche'
import Big from 'big.js'
import { bnToBig } from '@/helpers/helper'
import { ChainIdType } from '@/constants'
import { avm } from '@/AVA'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import AvaAsset from '@/js/AvaAsset'
import { ChainSwapFormData } from '@/components/wallet/earn/ChainTransfer/types'

const chainTypes: ChainIdType[] = ['X', 'P', 'C']
const chainNames = {
    X: 'X Chain (Exchange)',
    C: 'C Chain (Contract)',
    P: 'P Chain (Platform)',
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
        return this.isEVMSupported
            ? ({
                  X: ['P', 'C'],
                  P: ['X'],
                  C: ['X'],
              }[this.sourceChain] as ChainIdType[])
            : //   @ts-ignore
              ({
                  X: ['P'],
                  P: ['X'],
              }[this.sourceChain] as ChainIdType[])
    }

    @Watch('destinationOptions')
    onDestinationsChange() {
        this.targetChain = this.destinationOptions[0]
        this.onChange()
    }

    // @Watch('sourceOptions')
    // onSourcesChange() {
    //     this.targetChain = this.destinationOptions[0]
    //     this.onChange()
    // }

    get platformUnlocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalance']
    }

    get avmUnlocked(): BN {
        if (!this.ava_asset) return new BN(0)
        return this.ava_asset.amount
    }

    get evmUnlocked(): BN {
        let balRaw = this.wallet.ethBalance
        return balRaw.div(new BN(Math.pow(10, 9)))
    }

    get balanceDestination() {
        if (this.targetChain === 'X') {
            return this.avmUnlocked
        } else if (this.targetChain === 'P') {
            return this.platformUnlocked
        } else {
            return this.evmUnlocked
        }
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

    // Fee is 2 times the tx transfer fee
    get fee(): Big {
        let feeX = avm.getTxFee()
        let totFee = feeX.mul(new BN(2))

        let feeXBig = bnToBig(totFee, 9)

        return feeXBig
    }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get wallet() {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet
    }

    get isEVMSupported() {
        return this.wallet.ethAddress
    }

    onChangeSource(ev: any) {
        let val: ChainIdType = ev.target.value
        this.sourceChain = val
        this.onChange()
        // this.$emit('change', val)
    }

    onChangeDestination(ev: any) {
        let val: ChainIdType = ev.target.value
        this.targetChain = val
        this.onChange()
        // this.$emit('change', val)
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
    //overflow: auto;
    //display: grid;
    //grid-template-columns: 1fr 1fr;
    //column-gap: 20px;
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
    border-radius: 4px;
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
