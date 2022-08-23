<template>
    <div class="chain_card">
        <div class="input_group">
            <h4 v-if="isSource">{{ $t('cross_chain.card.source') }}</h4>
            <h4 v-else>{{ $t('cross_chain.card.destination') }}</h4>
            <p style="font-size: 3em" class="chain_alias">{{ chain }}</p>
        </div>
        <div>
            <div class="input_group">
                <label>{{ $t('cross_chain.card.name') }}</label>
                <p>{{ chainNames[chain] }}</p>
            </div>
            <div class="input_group">
                <label>{{ $t('cross_chain.card.balance') }}</label>
                <p class="balance">{{ balanceText }}</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ChainIdType } from '@/constants'
import { BN } from '@c4tplatform/camino'
import AvaAsset from '@/js/AvaAsset'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { WalletType } from '@/js/wallets/types'

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
        let wallet: MnemonicWallet = this.$store.state.activeWallet
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
        return balRaw.div(new BN(Math.pow(10, 9)))
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
@use '../../../../styles/main';

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
    border-radius: var(--border-radius-sm) !important;
}

.input_group {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

p {
    font-size: 14px;
    word-break: break-all;
}

@include main.mobile-device {
    .chain_card {
        display: block;
    }
    h4,
    .chain_alias {
        text-align: center;
    }
}
</style>
