<template>
    <tr class="validator_row">
        <td class="id">{{ validator.nodeID }}</td>
        <td class="amount">{{ amtText }}</td>
        <td class="amount">{{ remainingAmtText }}</td>
        <td style="text-align: center">{{ numDelegators }}</td>
        <td>{{ remainingTimeText }}</td>
        <!--        <td>{{ uptimeText }}</td>-->
        <td>{{ feeText }}%</td>
        <td>
            <button class="button_secondary" @click="select">Select</button>
        </td>
    </tr>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import moment from 'moment'
import { BN } from '@c4tplatform/camino'
import { bnToBig } from '@/helpers/helper'
import { ValidatorListItem } from '@/store/modules/platform/types'

@Component
export default class ValidatorsList extends Vue {
    @Prop() validator!: ValidatorListItem

    get remainingMs(): number {
        let end = this.validator.endTime
        let remain = end.getTime() - Date.now()
        return remain
    }

    get remainingTimeText() {
        let ms = this.remainingMs
        let sec = ms / 1000

        let duration = moment.duration(ms, 'milliseconds')
        return duration.humanize(true)
    }

    get stakeAmt(): BN {
        return this.validator.validatorStake
    }

    get amtText() {
        let amt = this.stakeAmt
        let big = bnToBig(amt, 9)
        return big.toLocaleString(0)
    }

    get uptimeText(): string {
        let uptime = this.validator.uptime * 100

        // if(!uptime) return '?';

        return uptime.toFixed(2) + ' %'
    }

    get feeText() {
        return this.validator.fee
    }

    // TODO :HEAVY
    // get delegators(): DelegatorRaw[]{
    //     return [];
    // let map = this.$store.getters["Platform/nodeDelegatorMap"];
    // return map[this.validator.nodeID];
    // }

    // TODO :HEAVY
    get numDelegators() {
        return this.validator.numDelegators
        // if(!this.delegators) return 0;
        // return this.delegators.length;
    }

    // TODO :HEAVY
    get totalDelegated(): BN {
        return this.validator.delegatedStake
        // return new BN(0)
        // return this.$store.getters["Platform/validatorTotalDelegated"](this.validator.nodeID);
    }

    // TODO :HEAVY
    // get maxStake(): BN{
    //     return new BN(300000000000000)
    // return this.$store.getters["Platform/validatorMaxStake"](this.validator);
    // }

    // TODO :HEAVY
    get remainingStake(): BN {
        // return new BN(1000000000000)
        return this.validator.remainingStake
        // return this.maxStake.sub(this.totalDelegated.add(this.stakeAmt));
    }

    get remainingAmtText(): string {
        let big = bnToBig(this.remainingStake, 9)
        return big.toLocaleString(0)
    }

    // TODO: Move this to
    // get isVisible(){
    //
    //     If remaining amount is less than the minimum delegation amount
    // let minDelAmt = this.$store.state.Platform.minStakeDelegation;
    // if(this.remainingStake.lt(minDelAmt)) return false;
    // return true;
    // }

    select() {
        this.$emit('select', this.validator)
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.amount {
    text-align: right;
    font-family: monospace;
}

button {
    padding: 3px 12px;
    font-size: 13px;
    border-radius: 3px;
}

.id {
    word-break: break-all;
}
td {
    padding: 4px 14px;
    background-color: var(--bg-light);
    border: 1px solid var(--bg);
    font-size: 13px;
}

@include main.medium-device {
    td {
        font-size: 10px !important;
    }
}
</style>
