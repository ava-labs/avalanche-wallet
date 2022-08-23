<template>
    <div class="currency_select">
        <button @click="setType('NATIVE')" :active="currency === 'NATIVE'">
            {{ nativeAssetSymbol }}
        </button>
        <button @click="setType('USD')" :active="currency === 'USD'">USD</button>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Model } from 'vue-property-decorator'
import { CurrencyType } from '@/components/misc/CurrencySelect/types'

@Component
export default class CurrencySelect extends Vue {
    @Model('change', { type: String }) readonly currency!: CurrencyType
    setType(val: CurrencyType): void {
        this.$emit('change', val)
    }
    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
.currency_select {
    display: flex;
    width: max-content;
    background-color: var(--bg-light);
    border-radius: var(--border-radius-sm);
    overflow: hidden;
}

button {
    margin: 0;
    border-radius: 0;
    padding: 3px 6px;
    font-size: 12px;
    color: var(--primary-color-light);
    transition-duration: 0.2s;

    &:hover {
        background-color: var(--primary-color-light);
        color: var(--bg);
    }

    &[active] {
        background-color: var(--primary-color);
        color: var(--bg);
    }
}
</style>
