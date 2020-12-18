<template>
    <div class="chain_card">
        <div>
            <label v-if="isSource">Source</label>
            <label v-else>Destination</label>
            <h4>{{ chain }}</h4>
        </div>
        <div class="input_group">
            <label>Select Chain</label>
            <select @input="onChange">
                <option v-for="option in options" :value="option" :key="option">
                    {{ chainNames[option] }}
                </option>
            </select>
        </div>
        <div class="input_group">
            <label>Balance</label>
            <p>{{ balanceText }} AVAX</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator'
import { UTXO } from 'avalanche/dist/apis/platformvm'
import { ChainIdType } from '@/constants'
import { BN } from 'avalanche'
import AvaAsset from '@/js/AvaAsset'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { WalletType } from '@/store/types'
import { bnToBig } from '@/helpers/helper'

const chainTypes: ChainIdType[] = ['X', 'P', 'C']
const chainNames = {
    X: 'X Chain (Exchange)',
    C: 'C Chain (Contract)',
    P: 'P Chain (Platform)',
}

@Component
export default class ChainCard extends Vue {
    @Model('change', { type: String }) readonly chain!: ChainIdType
    @Prop() exclude!: ChainIdType
    @Prop({ default: true }) isSource?: boolean

    onChange(ev: any) {
        let val: ChainIdType = ev.target.value
        this.$emit('change', val)
    }

    get chainNames() {
        return chainNames
    }
    get options(): ChainIdType[] {
        let all = [...chainTypes]

        if (this.isSource) return all

        if (this.exclude === 'X') {
            return ['P', 'C']
        } else {
            return ['X']
        }
        // if (!this.exclude) return all
        // let index = all.indexOf(this.exclude)
        // all.splice(index, 1)
        // return all
    }

    @Watch('options')
    onOptionsChange(val: ChainIdType[]) {
        this.$emit('change', val[0])
    }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get wallet(): WalletType {
        let wallet: AvaHdWallet = this.$store.state.activeWallet
        return wallet
    }

    get platformUnlocked(): BN {
        return this.$store.getters.walletPlatformBalance
    }

    get platformLocked(): BN {
        return this.$store.getters.walletPlatformBalanceLocked
    }

    get avmUnlocked(): BN {
        if (!this.ava_asset) return new BN(0)
        return this.ava_asset.amount
    }

    get evmUnlocked(): BN {
        let balRaw = this.wallet.ethBalance
        return balRaw.divRound(new BN(Math.pow(10, 9)))
    }

    get balance() {
        if (this.chain === 'X') {
            return this.avmUnlocked
        } else if (this.chain === 'P') {
            return this.platformUnlocked
        } else {
            return this.evmUnlocked
        }
    }

    get balanceText() {
        let bn = this.balance
        return bnToBig(bn, 9).toLocaleString()
    }

    mounted() {}
}
</script>
<style scoped lang="scss">
h4 {
    font-size: 3em;
    font-family: Roboto, sans-serif;
    span {
        font-size: 14px;
    }
}
label {
    text-align: left;
    color: var(--primary-color-light);
    font-size: 13px;
}

select {
    color: var(--primary-color);
    border: 1px solid var(--primary-color-light);
    border-radius: 4px;
    padding: 2px 12px;
    font-size: 13px;
    width: max-content;
    outline: none;
}

.chain_card {
    background-color: var(--bg-light);
    padding: 12px 30px;
    border-radius: 4px;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.1);
}
.input_group {
    display: flex;
    flex-direction: column;
    margin-bottom: 14px;
}
</style>
