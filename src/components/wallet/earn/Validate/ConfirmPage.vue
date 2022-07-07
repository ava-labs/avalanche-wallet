<template>
    <div class="confirmation">
        <div>
            <label>{{ $t('earn.validate.confirmation.id') }}</label>
            <p style="word-break: break-all">{{ nodeID }}</p>
        </div>
        <div>
            <label>{{ $t('earn.validate.confirmation.amount') }}</label>
            <p>{{ amtText }} {{ nativeAssetSymbol }}</p>
        </div>
        <div>
            <label>{{ $t('earn.validate.confirmation.start') }}</label>
            <p>{{ $t('earn.validate.confirmation.start_desc') }}</p>
        </div>
        <div>
            <label>{{ $t('earn.validate.confirmation.end') }}</label>
            <p>{{ end.toLocaleString() }}</p>
        </div>
        <div>
            <label>{{ $t('earn.validate.confirmation.fee') }}</label>
            <p>{{ delegationFee }} %</p>
        </div>
        <div>
            <label>{{ $t('earn.validate.confirmation.reward') }} ({{ walletType }})</label>
            <p style="word-break: break-all">{{ rewardAddress }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BN } from '@c4tplatform/camino'
import Big from 'big.js'

@Component
export default class ConfirmPage extends Vue {
    @Prop() nodeID!: string
    @Prop() end!: Date
    @Prop() delegationFee!: number
    @Prop() amount!: BN
    @Prop() rewardAddress!: string
    @Prop() rewardDestination!: string

    // amountCopy: BN = new BN(0);

    // @Watch('amount')
    // onAmountChange(val: BN){
    //     console.log(val.toString(), val);
    //     this.amountCopy = val.clone()
    //     this.amountCopy = val.
    // }

    // get startDate(){
    //     return new Date(this.start);
    // }
    //
    // get endDate(){
    //     return new Date(this.end);
    // }

    get amtBig(): Big {
        let stakeAmt = Big(this.amount.toString()).div(Math.pow(10, 9))
        return stakeAmt
    }

    get walletType() {
        if (this.rewardDestination === 'local') {
            return this.$t('earn.validate.confirmation.type_local')
        }
        return this.$t('earn.validate.confirmation.type_custom')
    }

    get amtText(): string {
        let amt = this.amtBig
        return amt.toLocaleString(9)
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
.confirmation {
    > div {
        background-color: var(--bg-light);
        margin: 14px 0;
        padding: 6px 14px;

        label {
            font-size: 14px;
            color: var(--primary-color-light);
        }
        p {
            font-size: 18px;
        }
    }

    .err {
        font-size: 14px;
    }
}
</style>
