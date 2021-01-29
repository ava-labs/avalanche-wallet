<template>
    <div class="chain_select">
        <button @click="setChain('X')" :active="chain === 'X'">X</button>
        <button @click="setChain('P')" :active="chain === 'P'">P</button>
        <button @click="setChain('C')" :active="chain === 'C'" v-if="!isLedger">C</button>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch, Model } from 'vue-property-decorator'
import AvaAsset from '@/js/AvaAsset'
import { ChainAlias } from '@/js/wallets/IAvaHdWallet'
import { WalletType } from '@/store/types'

@Component
export default class ChainSelect extends Vue {
    @Model('change', { type: String }) readonly chain!: ChainAlias

    //TODO: Remove after ledger support
    get isLedger() {
        let wallet: WalletType | null = this.$store.state.activeWallet
        if (!wallet) return false
        return wallet.type === 'ledger'
    }
    setChain(val: ChainAlias) {
        this.$emit('change', val)
    }
}
</script>
<style scoped lang="scss">
.chain_select {
    display: flex;
    font-size: 13px;
    color: var(--primary-color-light);
}
button {
    margin-right: 6px;
    border-radius: 3px;
    background-color: var(--bg-light);
    padding: 0px 5px;
    opacity: 0.8;
    outline: none !important;

    &:hover {
        opacity: 1;
        color: var(--primary-color);
    }
    &[active] {
        opacity: 1;
        background-color: var(--primary-color);
        color: var(--bg);
    }
}
</style>
