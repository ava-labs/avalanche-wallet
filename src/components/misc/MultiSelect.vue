<template>
    <div class="radio_buts">
        <button
            v-for="(key, i) in keys"
            :key="key"
            @click="select(key)"
            :active="selectionSet.has(key)"
            class="hover_border"
            :disabled="disabled"
        >
            {{ labels[i] }}
        </button>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator'
import RadioButtons from './RadioButtons.vue'

@Component
export default class MultiSelect extends Vue {
    @Prop() labels!: string[]
    @Prop() keys!: string[]
    @Prop({ default: false }) disabled!: boolean

    @Model('change', { type: Array }) readonly selection!: string[]

    get selectionSet() {
        return new Set(this.selection)
    }

    select(val: string) {
        const now: Set<string> = new Set(this.selection)
        if (now.has(val)) {
            now.delete(val)
        } else {
            now.add(val)
        }
        this.$emit('change', Array.from(now))
    }
}
</script>
<style scoped lang="scss">
@use '../../main';
.radio_buts {
    display: flex;
    flex-wrap: wrap;
}
button {
    word-break: normal;
    white-space: nowrap;
    font-weight: bold;
    font-size: 14px;
    padding: 4px 14px;
    border: 1px solid transparent;
    color: var(--primary-color-light);
    background-color: var(--bg-wallet);
    border-radius: 4px;
    margin-right: 6px;
    margin-bottom: 6px;
    transition-duration: 0.2s;
    font-family: Inconsolata, monospace;

    &[active] {
        color: var(--bg-wallet);
        background-color: var(--primary-color);
    }

    &[disabled] {
        opacity: 0.4;
    }
}

@include main.medium-device {
    button {
        font-size: 11px;
        padding: 4px 8px;
    }
}
</style>
