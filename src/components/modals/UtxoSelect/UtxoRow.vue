<template>
    <tr :locked="isLocked">
        <td style="text-align: left; padding-left: 8px">
            <input type="checkbox" @change="onSelect" v-model="isSelect" />
        </td>
        <td>
            <template v-if="isLocked"><fa icon="lock"></fa></template>
            <template v-else></template>
        </td>
        <td class="amt_col">{{ amount.toLocaleString() }}</td>
        <td class="date_col">{{ lockDateText }}</td>
    </tr>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {
    UTXO,
    PlatformVMConstants,
    AmountOutput,
    StakeableLockOut,
} from 'avalanche/dist/apis/platformvm'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
import { UnixNow } from 'avalanche/dist/utils'
import { BN } from 'avalanche'

@Component
export default class UtxoRow extends Vue {
    @Prop() utxo!: UTXO
    isSelect = false

    onSelect() {
        if (this.isSelect) {
            this.$emit('add')
        } else {
            this.$emit('remove')
        }
    }
    get out() {
        return this.utxo.getOutput()
    }

    get amount(): Big {
        let outId = this.out.getOutputID()
        if (outId === PlatformVMConstants.SECPXFEROUTPUTID) {
            let out = this.out as AmountOutput
            let amtBig = bnToBig(out.getAmount(), 9)
            return amtBig
        } else if (outId === PlatformVMConstants.STAKEABLELOCKOUTID) {
            let out = this.out as StakeableLockOut
            let amtBig = bnToBig(out.getAmount(), 9)
            return amtBig
        }

        return Big(0)
    }
    get lockTime(): BN {
        let outId = this.out.getOutputID()

        if (outId === PlatformVMConstants.SECPXFEROUTPUTID) {
            let out = this.out as AmountOutput
            return out.getLocktime()
        } else if (outId === PlatformVMConstants.STAKEABLELOCKOUTID) {
            let out = this.out as StakeableLockOut
            return out.getStakeableLocktime()
        }

        return new BN(0)
    }

    get lockDateText(): string {
        if (this.lockTime.eq(new BN(0))) {
            return '-'
        }
        let date = new Date(this.lockTime.toNumber() * 1000)

        return date.toLocaleString()
    }

    get isLocked(): boolean {
        let now = UnixNow()

        if (now.lt(this.lockTime)) {
            return true
        }

        return false
    }
}
</script>
<style scoped lang="scss">
td {
    font-size: 14px;
}
.date_col {
    color: var(--primary-color-light);
    text-align: right;
    padding-right: 8px;
}

tr[locked] {
    .date_col {
        color: var(--primary-color);
    }
}

.amt_col,
.date_col {
    font-family: monospace;
}
</style>
