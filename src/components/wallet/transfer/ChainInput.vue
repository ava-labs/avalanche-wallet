<template>
    <div v-if="isEVMSupported" class="header">
        <div class="header__container">
            <h1>{{ $t('transfer.source_chain.title') }}</h1>
            <div v-if="formType === 'P'" class="refresh">
                <button @click="refresh">
                    <v-icon>mdi-refresh</v-icon>
                </button>
            </div>
        </div>
        <div class="chain_select">
            <button :active="formType === 'P'" @click="set('P')">P</button>
            <button :active="formType === 'X'" @click="set('X')">X</button>
            <button :active="formType === 'C'" @click="set('C')">C</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Model, Prop } from 'vue-property-decorator'
import { ChainIdType } from '@/constants'

@Component
export default class ChainInput extends Vue {
    @Model('change', { type: String }) readonly formType!: ChainIdType
    @Prop({ default: false }) disabled!: boolean

    set(val: ChainIdType) {
        if (this.disabled) return
        this.$emit('change', val)
    }

    refresh() {
        this.$emit('refresh')
    }
    get wallet() {
        return this.$store.state.activeWallet
    }

    get isEVMSupported() {
        return this.wallet?.ethAddress
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/abstracts/mixins';

label {
    color: var(--primary-color-light);
}
.header {
    h1 {
        font-weight: normal;
    }
    &__container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        i {
            color: white;
            margin-right: 1rem;
        }
    }
}

.chain_select {
    display: flex;
    width: max-content;
    > button {
        padding-right: 14px;
        opacity: 0.2;
        transition-duration: 0.1s;
        cursor: pointer;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        font-size: 28px;

        &:hover {
            opacity: 1;
        }
        &[active] {
            color: var(--secondary-color);
            opacity: 1;
        }
    }
}

@include mixins.mobile-device {
    .chain_select {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        column-gap: 14px;
        > button {
            margin: 0;
            justify-content: center;
            text-align: center;
            background-color: var(--bg-light);
            color: var(--primary-color-light);

            &[active] {
                //background-color: var(--secondary-color);
                color: var(--primary-color);
                //color: #fff;
            }
        }
    }
}
</style>
