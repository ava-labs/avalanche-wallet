<template>
    <div>
        <v-checkbox :label="explain" v-model="value" @change="change" class="checkbox"></v-checkbox>
    </div>
</template>
<script>
export default {
    props: {
        value: Boolean,
        explain: {
            type: String,
            default: 'Back up your mnemonic keyphrase!',
        },
    },
    model: {
        prop: 'value',
        event: 'change',
    },
    methods: {
        change() {
            this.$emit('change', this.value)
        },
    },
}
</script>

<style lang="scss">
@use "../../styles/main";

.checkbox {
    .v-label {
        color: var(--primary-color);
    }

    .v-input--selection-controls__input {
        > * {
            color: var(--primary-color) !important;
        }
    }

    .v-input--selection-controls__ripple {
        color: var(--secondary-color) !important;
    }
}
</style>
