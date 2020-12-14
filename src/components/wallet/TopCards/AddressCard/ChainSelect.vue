<template>
    <div class="chain_select">
        <button @click="setChain('X')" :active="chain === 'X'">X</button>
        <button @click="setChain('P')" :active="chain === 'P'">P</button>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch, Model } from 'vue-property-decorator'
import AvaAsset from '@/js/AvaAsset'
import { ChainAlias } from '@/js/wallets/IAvaHdWallet'

@Component
export default class ChainSelect extends Vue {
    @Model('change', { type: String }) readonly chain!: ChainAlias

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
    opacity: 0.6;

    &:hover {
        color: var(--primary-color);
    }
    &[active] {
        opacity: 1;
        color: var(--primary-color);
    }
}
</style>
