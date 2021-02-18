<template>
    <div v-if="!isLedger">
        <h4>{{ $t('transfer.source_chain.title') }}</h4>
        <div class="chain_select">
            <div :active="formType === 'X'" @click="set('X')">
                <h2>X</h2>
            </div>
            <div :active="formType === 'C'" @click="set('C')">
                <h2>C</h2>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Model, Prop } from 'vue-property-decorator'
import { ChainIdType } from '@/constants'
import { CurrencyType } from '@/components/misc/CurrencySelect/types'

@Component
export default class ChainInput extends Vue {
    @Model('change', { type: String }) readonly formType!: CurrencyType
    @Prop({ default: false }) disabled!: boolean

    set(val: ChainIdType) {
        if (this.disabled) return
        this.$emit('change', val)
    }

    get wallet() {
        return this.$store.state.activeWallet
    }

    // TODO: Remove after ledger support
    get isLedger() {
        let wallet = this.wallet
        if (!wallet) return false
        return wallet.type === 'ledger'
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';
h4 {
    margin: 12px 0;
}
.chain_select {
    display: flex;
    width: max-content;
    > div {
        //border: 1px solid var(--primary-color);
        //margin-right: 14px;
        padding: 0px 14px;
        opacity: 0.6;
        transition-duration: 0.2s;
        cursor: pointer;
        color: var(--primary-color);
        //background-color: var(--bg-light);
        display: flex;
        align-items: center;

        &:hover {
            opacity: 1;
        }
        &[active] {
            //background-color: var(--secondary-color);
            color: var(--secondary-color);
            //border-color: var(--primary-color-light);
            opacity: 1;
        }

        > p {
            margin-left: 12px !important;
        }
    }
}

@include main.mobile-device {
    .chain_select {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 14px;
        > div {
            margin: 0;
            justify-content: center;
        }
    }
}
</style>
