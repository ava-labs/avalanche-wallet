<template>
    <div class="evm_dropdown hover_border" :active="isPopup" :disabled="disabled">
        <button @click="showPopup" :disabled="disabled">
            {{ symbol }}
        </button>
        <div class="list">
            <div class="token_row" @click="select('native')">
                <img src="/img/ava_icon.png" />
                <p>AVAX</p>
                <p class="col_bal">{{ avaxBalance.toLocaleString() }}</p>
            </div>
            <div v-for="t in tokens" :key="t.data.address" class="token_row" @click="select(t)">
                <img :src="t.data.logoURI" />
                <p>{{ t.data.symbol }}</p>
                <p class="col_bal">{{ t.balanceBig.toLocaleString() }}</p>
            </div>
        </div>
        <div class="bg" v-if="isPopup" @click="close"></div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Erc20Token from '@/js/Erc20Token'
import { WalletType } from '@/store/types'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
@Component
export default class EVMAssetDropdown extends Vue {
    isPopup = false
    selected: Erc20Token | 'native' = 'native'

    @Prop({ default: false }) disabled!: boolean

    get tokens(): Erc20Token[] {
        let tokens: Erc20Token[] = this.$store.getters['Assets/networkErc20Tokens']
        let filt = tokens.filter((t) => {
            if (t.balanceBN.isZero()) return false
            return true
        })
        return filt
    }

    get symbol() {
        if (this.selected === 'native') return 'AVAX'
        else return this.selected.data.symbol
    }
    showPopup() {
        this.isPopup = true
    }

    get avaxBalance(): Big {
        let w: WalletType | null = this.$store.state.activeWallet
        if (!w) return Big(0)
        let balBN = w.ethBalance
        return bnToBig(balBN, 18)
    }

    close() {
        this.isPopup = false
    }

    select(token: Erc20Token | 'native') {
        this.selected = token
        this.$emit('change', token)
        this.close()
    }
}
</script>
<style scoped lang="scss">
@use "../../../main";
.evm_dropdown {
    position: relative;
}

button {
    text-align: center;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.list {
    position: absolute;
    top: 0;
    left: 100%;
    width: 260px;
    max-height: 0px;
    overflow: scroll;
    z-index: 2;
    border-radius: 4px;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
    background-color: var(--bg);
}

.token_row {
    font-size: 13px;
    padding: 8px 18px;
    display: grid;
    grid-template-columns: max-content max-content 1fr;
    column-gap: 12px;
    cursor: pointer;
    user-select: none;

    > * {
        align-self: center;
    }

    img {
        height: 24px;
        object-fit: contain;
    }

    &:hover {
        //background-color: rgba(var(--bg-1), 0.5);
        background-color: var(--bg-light);
    }
}

.evm_dropdown[active] {
    .list {
        max-height: 240px;
    }
}

.col_bal {
    text-align: right;
}

.bg {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: #0003;
}
@include main.mobile-device {
    .list {
        border-top-right-radius: 14px;
        border-top-left-radius: 14px;
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        top: unset;
        height: 40vh;
    }

    .token_row {
        font-size: 16px;
        border-bottom: 1px solid var(--bg-light);
        padding-top: 14px;
        padding-bottom: 14px;
        img {
            height: 30px;
        }
    }
}
</style>
