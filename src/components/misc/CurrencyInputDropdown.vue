<template>
    <div>
        <div class="curr_in_drop">
            <div class="max_in_cont hover_border">
                <button class="max_but" @click="maxOut" :disabled="disabled">MAX</button>
                <div class="col_big_in">
                    <big-num-input
                        ref="bigIn"
                        @change="amount_in"
                        class="bigIn"
                        contenteditable="bigIn"
                        :max="max_amount"
                        :denomination="denomination"
                        :step="stepSize"
                        :placeholder="placeholder"
                        :disabled="disabled"
                    ></big-num-input>
                    <p class="usd_val" :active="isAvax">${{ amountUSD.toLocaleString(2) }}</p>
                </div>
            </div>
            <BalanceDropdown
                :disabled_assets="disabled_assets"
                v-model="asset_now"
                :disabled="disabled"
            ></BalanceDropdown>
            <div class="col_balance">
                <p>
                    {{ $t('misc.balance') }}:
                    {{ maxAmountBig.toLocaleString(denomination) }}
                </p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { BN } from '@c4tplatform/camino'

// @ts-ignore
import { BigNumInput } from '@c4tplatform/vue_components'
import AvaAsset from '@/js/AvaAsset'
import { ICurrencyInputDropdownValue } from '@/components/wallet/transfer/types'
import { IWalletAssetsDict, priceDict } from '@/store/types'

import BalanceDropdown from '@/components/misc/BalancePopup/BalanceDropdown.vue'
import { ava } from '@/AVA'
import Big from 'big.js'
import { bnToBig } from '@/helpers/helper'

@Component({
    components: {
        BigNumInput,
        BalanceDropdown,
    },
})
export default class CurrencyInputDropdown extends Vue {
    amount: BN = new BN(0)
    asset_now: AvaAsset = this.walletAssetsArray[0]

    @Prop({ default: () => [] }) disabled_assets!: AvaAsset[]
    @Prop({ default: '' }) initial!: string
    @Prop({ default: false }) disabled!: boolean

    $refs!: {
        bigIn: BigNumInput
    }

    mounted() {
        if (this.isEmpty) return
        if (this.initial) {
            let initialAsset = this.walletAssetsDict[this.initial]
            this.drop_change(initialAsset)
        } else {
            this.drop_change(this.walletAssetsArray[0])
        }
    }

    @Watch('asset_now')
    drop_change(val: AvaAsset) {
        this.asset_now = val
        this.$refs.bigIn.clear()
        // this.amount_in(new BN(0))
        this.onchange()
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
    maxOut() {
        // @ts-ignore
        this.$refs.bigIn.maxout()
    }

    amount_in(val: BN) {
        this.amount = val
        this.onchange()
    }

    // onchange event for the Component
    @Emit('change')
    onchange(): ICurrencyInputDropdownValue {
        return {
            asset: this.asset_now,
            amount: this.amount,
        }
    }

    onfocus() {
        console.log('focus')
    }

    get amountUSD(): Big {
        let usdPrice = this.priceDict.usd
        let bigAmt = bnToBig(this.amount, this.denomination)
        let usdBig = bigAmt.times(usdPrice)
        return usdBig
    }

    get isEmpty(): boolean {
        if (this.walletAssetsArray.length === 0) {
            return true
        } else {
            return false
        }
    }

    get isAvax(): boolean {
        if (this.asset_now.id === this.avaxAsset?.id) return true
        return false
    }

    get display(): string {
        return ''
    }

    get placeholder(): string {
        if (this.isEmpty || !this.asset_now) return '0.00'
        let deno = this.asset_now.denomination
        let res = '0'
        if (deno > 2) {
            res = '0.00'
        }
        return res
    }

    get denomination(): number {
        if (!this.asset_now) return 0
        return this.asset_now.denomination
    }

    get walletAssetsArray(): AvaAsset[] {
        // return this.$store.getters.walletAssetsArray
        return this.$store.getters['Assets/walletAssetsArray']
    }

    get walletAssetsDict(): IWalletAssetsDict {
        // return this.$store.getters['walletAssetsDict']
        return this.$store.getters['Assets/walletAssetsDict']
    }

    get avaxAsset(): AvaAsset | null {
        return this.$store.getters['Assets/AssetAVA']
    }

    get max_amount(): null | BN {
        if (!this.asset_now) return null
        if (!this.avaxAsset) return null

        let assetId = this.asset_now.id
        let balance = this.walletAssetsDict[assetId]

        let avaxId = this.avaxAsset.id

        // Max amount is BALANCE - FEE for native Asset
        if (assetId === avaxId) {
            let fee = ava.XChain().getTxFee()
            // console.log(fee);
            if (fee.gte(balance.amount)) {
                return new BN(0)
            } else {
                return balance.amount.sub(fee)
            }
        }

        if (balance.amount.isZero()) return null
        return balance.amount
    }

    get maxAmountBig(): Big {
        if (!this.max_amount) return Big(0)
        return bnToBig(this.max_amount, this.denomination)
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.bigIn {
    width: 100%;
    border: none !important;
    font-size: 15px;
    font-family: monospace;
    /*background-color: #303030;*/
}

.max_in_cont {
    position: relative;
    display: grid;
    grid-template-columns: max-content 1fr;
    padding: 8px 14px;
    border-radius: var(--border-radius-sm);
}

.curr_in_drop {
    display: grid;
    grid-template-columns: 1fr 90px;
    background-color: transparent;
    //font-size: 12px;
    width: 100%;
    outline: none;
    text-align: right;
    column-gap: 10px;

    > * {
        background-color: var(--bg-light);
        border-radius: var(--border-radius-sm);
    }
}

input {
    flex-grow: 1;
    outline: none;
    text-align: right;
    flex-basis: 0px;
    width: 0px;
    color: var(--primary-color);
}

.max_but {
    opacity: 0.4;
    font-size: 13px;
    &:hover {
        opacity: 1;
    }
}

.dropdown {
    /*flex-basis: 140px;*/
    width: 100%;
    /*border-left: 1px solid #d2d2d2;*/
}

.balance {
    display: grid;
    column-gap: 10px;
    grid-template-columns: 1fr 140px;
    font-size: 14px;
    color: var(--primary-color-light);
    padding: 2px 0px;

    > div {
        display: flex;
        justify-content: space-between;
    }

    p {
        padding: 2px 0px;
    }

    p:last-child {
        text-align: right;
    }

    span {
        font-family: monospace;
        padding-left: 14px;
    }
}

.col_big_in {
    text-align: right;
    font-family: monospace;
    display: flex;
    flex-direction: column;
}

.col_balance {
    padding-right: 14px;
    padding-top: 2px !important;
    font-size: 15px;
    color: var(--primary-color-light);
    font-family: monospace;
    background-color: transparent;
}

.usd_val {
    color: var(--primary-color-light);
    font-size: 13px;
    max-height: 0px;
    overflow: hidden;
    transition-duration: 0.2s;

    &[active] {
        max-height: 20px;
    }
}

@include main.medium-device {
    .balance {
        grid-template-columns: 1fr;
    }
}

@include main.mobile-device {
    .balance,
    .curr_in_drop {
        grid-template-columns: 1fr 80px;
    }

    .balance {
        font-size: 12px;
    }
}
</style>
