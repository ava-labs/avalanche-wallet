<template>
    <div class="chain_select">
        <button @click="setChain('X')" :active="chain === 'X'">X</button>
        <button @click="setChain('P')" :active="chain === 'P'">P</button>
        <button @click="setChain('C')" :active="chain === 'C'" v-if="isEVMSupported">C</button>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Model } from 'vue-property-decorator'
import { ChainAlias, WalletType } from '@/js/wallets/types'

@Component
export default class ChainSelect extends Vue {
    @Model('change', { type: String }) readonly chain!: ChainAlias

    get isEVMSupported() {
        let wallet: WalletType | null = this.$store.state.activeWallet
        if (!wallet) return false
        return wallet.ethAddress
    }

    setChain(val: ChainAlias) {
        this.$emit('change', val)
    }
}
</script>
<style scoped lang="scss">
.chain_select {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    font-size: 13px;
    color: var(--primary-color-light);
}
button {
    padding: 8px 5px;
    opacity: 0.8;
    outline: none !important;
    font-weight: bold;
    background-color: var(--bg-wallet);
    &:hover {
        opacity: 1;
        color: var(--secondary-color);
    }
    &[active] {
        opacity: 1;
        background-color: var(--bg-light);
        color: var(--primary-color);
    }
}
</style>
