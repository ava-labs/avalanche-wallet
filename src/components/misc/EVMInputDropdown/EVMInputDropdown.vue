<template>
    <div class="evm_input_dropdown">
        <div class="col_in hover_border" :disabled="disabled">
            <button class="max_but" @click="maxOut" :disabled="disabled">MAX</button>
            <BigNumInput
                :max="max_amount"
                :denomination="denomination"
                :step="stepSize"
                :placeholder="placeholder"
                ref="bigIn"
                @change="amount_in"
                class="bigIn"
                :disabled="disabled"
            ></BigNumInput>
        </div>
        <!--        <div>-->
        <EVMAssetDropdown
            @change="onAssetChange"
            :disabled="disabled"
            ref="dropdown"
        ></EVMAssetDropdown>
        <div class="bal_col">
            <p class="bal">Balance: {{ balance }}</p>
        </div>
        <!--        </div>-->
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
//@ts-ignore
import { BigNumInput } from '@avalabs/vue_components'
import { BN } from 'avalanche'
import EVMAssetDropdown from '@/components/misc/EVMInputDropdown/EVMAssetDropdown.vue'
import Erc20Token from '@/js/Erc20Token'
import Big from 'big.js'
import { WalletType } from '@/store/types'
import { bnToBig } from '@/helpers/helper'
import EVMTokenSelectModal from '@/components/modals/EvmTokenSelect/EVMTokenSelectModal.vue'

@Component({
    components: {
        EVMTokenSelectModal,
        EVMAssetDropdown,
        BigNumInput,
    },
})
export default class ERC20InputDropdown extends Vue {
    token: Erc20Token | 'native' = 'native'
    @Prop({ default: false }) disabled!: boolean

    $refs!: {
        bigIn: BigNumInput
        dropdown: EVMAssetDropdown
    }

    get max_amount(): BN {
        return this.balanceBN
    }

    get isNative() {
        return this.token === 'native'
    }
    get denomination() {
        if (this.isNative) {
            return 9
        } else {
            return (this.token as Erc20Token).data.decimals
        }
    }

    get stepSize() {
        if (this.denomination > 3) {
            let stepNum = Math.pow(10, this.denomination - 2)
            return new BN(stepNum.toString())
        } else {
            let stepNum = Math.pow(10, this.denomination)
            return new BN(stepNum.toString())
        }
    }

    get asset_now() {
        return {
            denomination: 2,
        }
    }

    get placeholder(): string {
        let deno = this.denomination
        let res = '0'
        if (deno > 2) {
            res = '0.00'
        }
        return res
    }

    maxOut() {
        // @ts-ignore
        this.$refs.bigIn.maxout()
    }

    get avaxBalanceBN(): BN {
        let w: WalletType | null = this.$store.state.activeWallet
        if (!w) return new BN(0)
        return w.ethBalance
    }

    get avaxBalance(): Big {
        return bnToBig(this.avaxBalanceBN, 18)
    }

    get balance(): Big {
        if (this.token === 'native') {
            return this.avaxBalance
        }
        return this.token.balanceBig
    }

    get balanceBN(): BN {
        if (this.token === 'native') {
            return new BN(this.avaxBalance.toString())
        }
        return this.token.balanceBN
    }

    setToken(token: 'native' | Erc20Token) {
        //@ts-ignore
        this.$refs.dropdown.select(token)
    }

    onAssetChange(token: Erc20Token | 'native') {
        this.token = token
        this.$refs.bigIn.clear()
        this.$emit('tokenChange', token)
    }

    amount_in(amt: BN) {
        this.$emit('amountChange', amt)
    }
}
</script>
<style scoped lang="scss">
.evm_input_dropdown {
    display: grid;
    grid-template-columns: 1fr 90px;
    column-gap: 10px;
    font-size: 15px;

    > div {
        border-radius: 3px;
        background-color: var(--bg-light);
        padding: 8px 14px;
    }
}

.col_in {
    position: relative;
    display: grid;
    grid-template-columns: max-content 1fr;
}

.bigIn {
    text-align: right;
    font-family: monospace;
    border: none !important;
    color: var(--primary-color);
}

.bal_col {
    background-color: transparent !important;
    padding-top: 2px !important;
}

.bal {
    text-align: right;
    font-family: monospace;
    color: var(--primary-color-light);
}
.max_but {
    opacity: 0.4;
    font-size: 13px;
    &:hover {
        opacity: 1;
    }
}
</style>
