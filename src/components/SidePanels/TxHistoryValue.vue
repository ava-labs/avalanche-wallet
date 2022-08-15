<template>
    <div class="utxo" :income="isIncome">
        <p class="action">{{ actionText }}</p>
        <p
            class="amount"
            :style="{
                color: color,
            }"
        >
            {{ amountText }} {{ symbolText }}
        </p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Big from 'big.js'
import AvaAsset from '@/js/AvaAsset'
import { TransactionType } from '@/store/modules/history/types'

@Component
export default class TxHistoryValue extends Vue {
    @Prop() amount!: number | string
    @Prop() assetId!: string
    @Prop() type!: TransactionType
    // @Prop() operationColor!: string
    @Prop() operationDirection!: 'Sent' | 'Received'

    get asset() {
        return (
            this.$store.state.Assets.assetsDict[this.assetId] ||
            this.$store.state.Assets.nftFamsDict[this.assetId]
        )
    }
    get color(): string {
        // if (this.type === 'operation') return this.operationColor
        if (this.type === 'add_validator') return '#008dc5'
        if (this.type === 'add_delegator') return '#008dc5'

        if (this.amount > 0) {
            return '#6BC688'
        } else if (this.amount === 0) {
            return '#999'
        } else {
            return '#d04c4c'
        }
    }

    get isIncome(): boolean {
        if (this.amount > 0) {
            return true
        }
        return false
    }
    get actionText(): string {
        switch (this.type) {
            case 'pvm_import':
                return 'Import (P)'
            case 'import':
                return 'Import (X)'
            case 'pvm_export':
                return 'Export (P)'
            case 'export':
                return 'Export (X)'
            case 'base':
                if (this.isIncome) {
                    return 'Received'
                }
                return 'Sent'
            case 'operation':
                return this.operationDirection
            default:
                // Capitalize first letter
                return this.type
                    .split('_')
                    .map((value) => value[0].toUpperCase() + value.substring(1))
                    .join(' ')
        }
    }
    get amountText(): string {
        let asset = this.asset

        if (!asset) return this.amount.toString()

        try {
            let val = Big(this.amount).div(Math.pow(10, asset.denomination))
            return val.toLocaleString()
        } catch (e) {
            return ''
        }
    }

    get symbolText(): string {
        let asset = this.asset

        if (!asset) return this.assetId.substring(0, 4)

        return asset.symbol
    }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    created() {
        if (this.type === 'base') {
            if (!this.asset) {
                this.$store.dispatch('Assets/addUnknownAsset', this.assetId)
            }
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.utxo {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 10px;

    > * {
        align-self: center;
    }

    &:not(:first-child) {
        .action {
            visibility: hidden;
        }
    }
}

.action {
    font-size: 12px;
    color: main.$primary-color-light;
}
.amount {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
}

@include main.medium-device {
    .amount {
        font-size: 14px;
    }
}
</style>
