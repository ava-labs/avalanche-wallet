<template>
    <div class="chain_card">
        <div class="input_group">
            <h4 v-if="isSource">Source</h4>
            <h4 v-else>Destination</h4>
            <p style="font-size: 3em">{{ chain }}</p>
        </div>
        <div>
            <div class="input_group">
                <label>Name</label>
                <p style="font-size: 14px">{{ chainNames[chain] }}</p>
            </div>
            <div class="input_group">
                <label>Balance</label>
                <NumberCounter :value="balanceBig"></NumberCounter>
                <!--                <p>{{ balanceText }}</p>-->
            </div>
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
import NumberCounter from '@/components/misc/NumberCounter.vue'

const chainTypes: ChainIdType[] = ['X', 'P', 'C']
const chainNames = {
    X: 'Exchange Chain',
    C: 'Contract Chain',
    P: 'Platform Chain',
}

@Component({
    components: {
        NumberCounter,
    },
})
export default class ChainCard extends Vue {
    // @Model('change', { type: String }) readonly chain!: ChainIdType
    @Prop() chain!: ChainIdType
    // @Prop() exclude!: ChainIdType
    @Prop({ default: true }) isSource?: boolean

    onChange(ev: any) {
        let val: ChainIdType = ev.target.value
        this.$emit('change', val)
    }

    get chainNames() {
        return chainNames
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
        // return this.$store.getters.walletPlatformBalance
        return this.$store.getters['Assets/walletPlatformBalance']
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

    get balanceBig() {
        return bnToBig(this.balance, 9)
    }
    get balanceText() {
        return this.balanceBig.toLocaleString()
    }

    mounted() {}
}
</script>
<style scoped lang="scss">
label {
    text-align: left;
    color: var(--primary-color-light);
    font-size: 13px;
}

.chain_card {
    //height: max-content;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 14px;
}

.input_group {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

p {
    font-size: 1.2em;
}
</style>
