<template>
    <div class="evm_input_dropdown">
        <div class="col_in hover_border" :disabled="disabled">
            <template v-if="!isCollectible">
                <button class="max_but" @click="maxOut" :disabled="disabled">MAX</button>
                <div class="col_big_in">
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
                    <p class="usd_val" :active="token === 'native'">
                        ${{ usd_val.toLocaleString(2) }}
                    </p>
                </div>
            </template>
            <template v-else>
                <ERCNftView
                    :token="collectible.token"
                    :index="collectible.id"
                    class="collectible_item"
                ></ERCNftView>
                <p style="align-self: center; padding-left: 12px">
                    TOKEN ID: {{ collectible.id.tokenId }}
                </p>
            </template>
        </div>
        <EVMAssetDropdown
            @change="onAssetChange"
            @changeCollectible="onCollectibleChange"
            :disabled="disabled"
            ref="dropdown"
        ></EVMAssetDropdown>
        <div class="bal_col" v-if="!isCollectible">
            <p class="bal">Balance: {{ balance.toLocaleString() }}</p>
        </div>
        <div class="bal_col" v-else>
            <p class="bal">Balance: {{ collectible.id.quantity }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
//@ts-ignore
import { BigNumInput } from '@c4tplatform/vue_components'
import { BN } from '@c4tplatform/camino'
import EVMAssetDropdown from '@/components/misc/EVMInputDropdown/EVMAssetDropdown.vue'
import Erc20Token from '@/js/Erc20Token'
import Big from 'big.js'
import { WalletType } from '@/js/wallets/types'

import { bnToBig } from '@/helpers/helper'
import { iERCNftSelectInput } from '@/components/misc/EVMInputDropdown/types'
import ERCNftView from '@/components/misc/ERCNftView.vue'
import ERCNftToken from '@/js/ERCNftToken'
import { ERCNftBalance } from '@/store/modules/assets/modules/types'

@Component({
    components: {
        ERCNftView,
        EVMAssetDropdown,
        BigNumInput,
    },
})
export default class EVMInputDropdown extends Vue {
    token: Erc20Token | 'native' = 'native'
    isCollectible = false
    collectible: iERCNftSelectInput | null = null
    @Prop({ default: false }) disabled!: boolean
    @Prop() gasPrice!: BN // in wei
    @Prop({ default: 21000 }) gasLimit!: number
    amt = new BN(0)

    $refs!: {
        bigIn: BigNumInput
        dropdown: EVMAssetDropdown
    }

    clear() {
        if (this.$refs.dropdown) this.$refs.dropdown.clear()
    }

    get usd_val(): Big {
        if (this.token != 'native') return Big(0)

        let price = this.$store.state.prices.usd
        let big = bnToBig(this.amt, 18)
        return big.mul(Big(price))
    }

    get max_amount(): BN {
        // Subtract gas
        if (this.isNative) {
            let limit = new BN(this.gasLimit)
            let fee = limit.mul(this.gasPrice)
            return this.balanceBN.sub(fee)
        } else {
            return this.balanceBN
        }
    }

    get isNative() {
        return this.token === 'native'
    }
    get denomination(): number {
        if (this.isNative) {
            return 18
        } else {
            return parseInt((this.token as Erc20Token).data.decimals as string)
        }
    }

    get stepSize(): BN {
        if (this.denomination > 3) {
            let powBN = new BN(10).pow(new BN(this.denomination - 2))
            // let stepNum = Math.pow(10, this.denomination - 2)
            return powBN
        } else {
            let powBN = new BN(10).pow(new BN(this.denomination))
            // let stepNum = Math.pow(10, this.denomination)
            return powBN
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

    // The available balance of the selected asset
    get balanceBN(): BN {
        if (this.token === 'native') {
            return this.avaxBalanceBN
        }
        return this.token.balanceBN
    }

    setToken(token: 'native' | Erc20Token) {
        this.$refs.dropdown.select(token)
    }

    setERCNftToken(token: ERCNftToken, tokenId: ERCNftBalance) {
        this.$refs.dropdown.selectERCNft({
            token: token,
            id: tokenId,
        })
    }

    onAssetChange(token: Erc20Token | 'native') {
        this.isCollectible = false
        this.token = token
        this.$nextTick(() => {
            this.$refs.bigIn.clear()
        })
        this.$emit('tokenChange', token)
    }

    onCollectibleChange(val: iERCNftSelectInput) {
        this.isCollectible = true
        this.collectible = val
        this.$emit('collectibleChange', val)
    }

    amount_in(amt: BN) {
        this.amt = amt
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

.col_big_in {
    text-align: right;
    font-family: monospace;
    display: flex;
    flex-direction: column;
}

.bigIn {
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
.max_but {
    opacity: 0.4;
    font-size: 13px;
    &:hover {
        opacity: 1;
    }
}

.collectible_item {
    height: 40px;
    width: 40px;
}
</style>
