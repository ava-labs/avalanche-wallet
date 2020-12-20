<template>
    <div>
        <h4>Select Chain</h4>
        <div class="chain_select">
            <div
                :active="formType === 'X'"
                @click="set('X')"
                class="hover_border"
            >
                <h2>X</h2>
                <p>Exchange</p>
            </div>
            <div
                :active="formType === 'C'"
                @click="set('C')"
                class="hover_border"
            >
                <h2>C</h2>
                <p>Contract</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Model } from 'vue-property-decorator'
import { ChainIdType } from '@/constants'
import { CurrencyType } from '@/components/misc/CurrencySelect/types'

@Component
export default class ChainInput extends Vue {
    @Model('change', { type: String }) readonly formType!: CurrencyType

    set(val: ChainIdType) {
        this.$emit('change', val)
    }
}
</script>
<style scoped lang="scss">
h4 {
    margin: 12px 0;
}
.chain_select {
    display: flex;
    > div {
        //border: 1px solid var(--primary-color);
        margin-right: 14px;
        padding: 8px;
        opacity: 0.5;
        border-radius: 4px;
        transition-duration: 0.2s;
        cursor: pointer;
        color: var(--primary-color);
        background-color: var(--bg-light);

        &:hover {
            background-color: var(--bg-light);
        }
        &[active] {
            border-color: var(--primary-color-light);
            opacity: 1;
        }
    }
}
</style>
