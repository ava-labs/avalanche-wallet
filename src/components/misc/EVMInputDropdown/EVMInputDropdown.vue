<template>
    <div class="evm_input_dropdown">
        <div class="col_in hover_border">
            <button @click="maxOut" class="max_but">MAX</button>
            <BigNumInput
                :max="max_amount"
                :denomination="denomination"
                :step="stepSize"
                :placeholder="placeholder"
                ref="bigIn"
                @change="amount_in"
                class="bigIn"
            ></BigNumInput>
        </div>
        <div>
            <EVMAssetDropdown></EVMAssetDropdown>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
//@ts-ignore
import { BigNumInput } from '@avalabs/vue_components'
import { BN } from 'avalanche'
import EVMAssetDropdown from '@/components/misc/EVMInputDropdown/EVMAssetDropdown.vue'

@Component({
    components: {
        EVMAssetDropdown,
        BigNumInput,
    },
})
export default class ERC20InputDropdown extends Vue {
    get max_amount(): BN {
        return new BN('10000000000')
    }

    get denomination() {
        return 9
    }

    get stepSize() {
        if (this.denomination > 3) {
            let stepNum = Math.pow(10, this.denomination - 2)
            return new BN(stepNum.toString())
        } else {
            let stepNum = Math.pow(10, this.denomination)
            return new BN(stepNum.toString())
        }
    }

    get asset_now() {
        return {
            denomination: 2,
        }
    }

    get isEmpty() {
        return false
    }

    get placeholder(): string {
        if (this.isEmpty || !this.asset_now) return '0.00'
        let deno = this.asset_now.denomination
        let res = '0'
        if (deno > 2) {
            res = '0.00'
        }
        return res
    }

    maxOut() {
        // @ts-ignore
        this.$refs.bigIn.maxout()
    }
}
</script>
<style scoped lang="scss">
.evm_input_dropdown {
    display: grid;
    grid-template-columns: 1fr max-content;
    column-gap: 10px;
    font-size: 15px;

    > div {
        border-radius: 3px;
        background-color: var(--bg-light);
        padding: 8px 14px;
    }
}

.col_in {
    display: grid;
    grid-template-columns: max-content 1fr;
}

.bigIn {
    text-align: right;
    font-family: monospace;
    border: none !important;
}

.max_but {
    opacity: 0.4;
    font-size: 13px;
    &:hover {
        opacity: 1;
    }
}
</style>
