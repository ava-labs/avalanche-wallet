<template>
    <div class="bal_row">
        <p class="symbol">{{ symbol }}</p>
        <p class="name">{{ name }}</p>
        <p class="amt">{{ asset.toString() }}</p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import AvaAsset from '@/js/AvaAsset'

@Component
export default class BalanceRow extends Vue {
    @Prop() asset!: AvaAsset

    get name() {
        let name = this.asset.name
        return name
    }

    get symbol() {
        let sym = this.asset.symbol
        return sym
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.symbol {
    background-color: var(--bg-light);
    border-radius: 6px;
    padding: 2px 6px;
    font-size: 11px;
    align-self: center;
    text-align: center;
}

.name {
    overflow: auto;
    text-overflow: ellipsis;
    align-self: center;
    white-space: nowrap;
    text-align: left;
}

.amt {
    text-align: right;
}

@include main.mobile-device {
}
</style>
