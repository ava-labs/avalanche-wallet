<template>
    <div class="tx_out">
        <div class="addresses">
            <p v-for="addr in summary.addresses" :key="addr">{{ direction }} {{ 'X-' + addr }}</p>
        </div>
        <p class="amount" :profit="isProfit">
            {{ amtText }}
            <template v-if="assetDetail">
                {{ assetDetail.symbol }}
            </template>
        </p>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BaseTxAssetSummary } from '@/helpers/history_helper'
import AvaAsset from '@/js/AvaAsset'
import { bnToBig } from '@/helpers/helper'
import { BN } from '@c4tplatform/camino'

@Component
export default class BaseTxOutput extends Vue {
    @Prop() assetID!: string
    @Prop() summary!: BaseTxAssetSummary

    get assetDetail(): AvaAsset {
        return (
            this.$store.state.Assets.assetsDict[this.assetID] ||
            this.$store.state.Assets.nftFamsDict[this.assetID]
        )
    }

    get payload() {
        return this.summary.payload
    }

    get isProfit() {
        return this.summary.amount.gte(new BN(0))
    }

    get actionText() {
        if (this.isProfit) {
            return 'Received'
        } else {
            return 'Sent'
        }
    }

    get direction() {
        if (this.isProfit) {
            return 'from'
        } else {
            return 'to'
        }
    }
    get amtText() {
        let big = bnToBig(this.summary.amount, this.assetDetail?.denomination || 0)
        return big.toLocaleString()
    }
}
</script>
<style scoped lang="scss">
@use "../../../../styles/main";
.tx_out {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 12px;
}
.amount {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
    color: #d04c4c;

    &[profit] {
        color: var(--success);
    }
}

.addresses {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-self: center;
    p {
        overflow: hidden;
        color: var(--primary-color-light);
        white-space: nowrap;
        font-size: 12px;
        line-height: 12px;
        font-family: monospace;
        text-overflow: ellipsis;
    }

    label {
        line-height: 12px;
    }
}
label {
    font-size: 12px;
    color: var(--primary-color-light);
}

@include main.medium-device {
    .amount {
        font-size: 13px;
    }
}
</style>
