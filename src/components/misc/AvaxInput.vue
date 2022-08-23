<template>
    <div class="avax_input">
        <div class="col1 hover_border">
            <button class="max_but" @click="maxOut" v-if="max">MAX</button>
            <BigNumInput
                ref="amt_in"
                class="amt_in"
                contenteditable="amt_in"
                :denomination="9"
                :max="max"
                placeholder="0.00"
                @change="amount_in"
            ></BigNumInput>
        </div>
        <p class="ticker">{{ nativeAssetSymbol }}</p>
        <div v-if="balance" class="balance">
            <div>
                <p>
                    <b>{{ $t('misc.balance') }}:</b>
                    {{ balance.toLocaleString() }}
                </p>
                <p>
                    <b>$</b>
                    {{ amountUSD.toLocaleString(2) }}
                </p>
            </div>
            <div></div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Model } from 'vue-property-decorator'
import { bnToBig, Big } from '@c4tplatform/camino-wallet-sdk'
//@ts-ignore
import { BigNumInput } from '@c4tplatform/vue_components'
import { BN } from '@c4tplatform/camino'
import { priceDict } from '../../store/types'

@Component({
    components: {
        BigNumInput,
    },
})
export default class AvaxInput extends Vue {
    @Model('change', { type: Object }) readonly amount!: BN

    @Prop({
        default: null,
    })
    max?: BN | null

    @Prop() balance?: Big | null
    @Prop() alias?: string

    maxOut(ev: MouseEvent) {
        ev.preventDefault()
        ev.stopPropagation()
        //@ts-ignore
        this.$refs.amt_in.maxout()
    }

    amount_in(val: BN) {
        this.$emit('change', val)
    }

    get amountUSD(): Big {
        let usdPrice = this.priceDict.usd
        let amount = bnToBig(this.amount, 9)
        let usdBig = amount.times(usdPrice)
        return usdBig
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.avax_input {
    display: grid;
    grid-template-columns: 1fr max-content;
    grid-gap: 0px 10px;
    color: var(--primary-color);
    width: 100%;
    height: 40px;

    .amt_in {
        color: var(--primary-color);
        font-size: 15px;
        font-family: monospace;
        flex-grow: 1;
        flex-shrink: 1;
        display: block;
        box-sizing: content-box;
        outline: none !important;
        border: none !important;
        //padding: 0 12px !important;
    }

    .ticker,
    .amt_in,
    .max_but {
        background-color: var(--bg-light);
        //border-radius: 3px;
    }
}

.balance {
    display: grid;
    column-gap: 10px;
    font-size: 14px;
    color: var(--primary-color-light);
    padding: 2px 0px;

    > div {
        display: flex;
        justify-content: space-between;
    }

    p {
        text-align: left;
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

.col1 {
    border-radius: var(--border-radius-sm);
    background-color: var(--bg-light);
    border: 1px solid transparent;
    //display: flex;
    display: grid;
    grid-template-columns: max-content 1fr;
    width: 100%;
    box-sizing: border-box;
    //overflow: auto;
    padding: 8px 14px;
    position: relative;

    //&:hover {
    //    border-color: var(--primary-color-light);
    //}
    //&:focus-within {
    //    border-color: var(--secondary-color);
    //}
}

.ticker {
    border-radius: var(--border-radius-sm);
    padding: 8px 14px;
}

p {
    text-align: center;
}
.max_but {
    font-size: 13px;
    opacity: 0.4;
    &:hover {
        opacity: 1;
    }
}

@include main.mobile-device {
    .balance {
        font-size: 12px;
    }
}
</style>
