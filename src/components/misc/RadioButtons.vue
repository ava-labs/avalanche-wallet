<template>
    <div class="radio_buts">
        <button
            v-for="(key, i) in keys"
            :key="key"
            @click="select(key)"
            :active="selection === key"
            class="hover_border"
        >
            {{ labels[i] }}
        </button>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator'

@Component
export default class RadioButtons extends Vue {
    @Prop() labels!: string[]
    @Prop() keys!: string[]

    @Model('change', { type: String }) readonly selection!: string

    select(val: string) {
        this.$emit('change', val)
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
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
    border-radius: var(--border-radius-sm);
    margin-right: 6px;
    margin-bottom: 6px;
    transition-duration: 0.2s;
    font-family: Inconsolata, monospace;

    //&:hover {
    //    border-color: var(--bg-light);
    //}

    &[active] {
        color: var(--primary-color);
        //border-color: #285599;
        background-color: var(--bg-light);
    }
}

@include main.medium-device {
    button {
        font-size: 11px;
        padding: 4px 8px;
    }
}
</style>
