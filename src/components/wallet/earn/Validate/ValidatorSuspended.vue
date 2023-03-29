<template>
    <div>
        <div class="validator_card">
            <p>{{ $t('validator.suspended.validator_suspended') }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
import AvaxInput from '@/components/misc/AvaxInput.vue'

@Component({
    name: 'validator_suspended',
    components: {
        AvaxInput,
    },
})
export default class ValidatorSuspended extends Vue {
    @Prop() nodeId!: string
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.validator_card {
    display: grid;
    column-gap: 20px;
}

.validator_child_card {
    height: 100%;
}

h4 {
    font-weight: normal;
}
.validator_info > div {
    display: grid;
    grid-template-columns: repeat(5, max-content);
    column-gap: 0px;
    margin-top: 12px;
    > div {
        position: relative;
        padding: 0 24px;
        border-right: 2px solid var(--bg-light);
        &:first-of-type {
            padding-left: 0;
        }
        &:last-of-type {
            border: none;
        }
    }

    label {
        font-size: 13px;
        color: var(--primary-color-light);
    }

    .icon-mdi-camino {
        font-size: 30px;
        color: var(--primary-color-light);
    }
}

.disabled_input {
    display: inline-block;
    border-radius: var(--border-radius-sm);
    color: gray;
    background-color: var(--bg-light);
    padding: 6px 14px;
    white-space: nowrap;
    width: 70%;
}

.disabled_input:focus-visible {
    outline: 0;
}

.input_label {
    margin-bottom: 0.5rem;
}

.amt_in {
    width: 70%;
}
</style>
