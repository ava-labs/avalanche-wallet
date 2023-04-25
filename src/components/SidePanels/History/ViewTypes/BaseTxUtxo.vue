<template>
    <div class="flex-row utxo">
        <div class="flex-row addresses">
            <p>{{ isSent ? 'to' : 'from' }}</p>
            <div class="flex-column">
                <p v-for="addr in addresses" :key="addr" class="address">{{ addr }}</p>
            </div>
        </div>
        <p :sent="isSent" class="token">
            <span v-if="isSent">-</span>
            {{ amountString }} {{ symbol }}
        </p>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Utxo } from '@avalabs/glacier-sdk'
import { BN } from 'avalanche'
import { bnToLocaleString } from '@avalabs/avalanche-wallet-sdk'

@Component
export default class BaseTxUtxo extends Vue {
    @Prop() utxo!: Utxo
    @Prop() ins!: Utxo[]
    @Prop() outs!: Utxo[]
    @Prop() isSent!: boolean

    get amountString() {
        return bnToLocaleString(new BN(this.utxo.asset.amount), this.denomination)
    }

    get symbol() {
        return this.utxo.asset.symbol
    }

    get denomination() {
        return this.utxo.asset.denomination
    }

    /**
     * Trim the address and prepend X-
     * @param address
     */
    formatAddress(address: string) {
        const len = address.length
        return `X-${address.slice(0, 9)}..${address.slice(len - 5)}`
    }

    get addresses() {
        // If this is a sent utxo, get who we sent to
        if (this.isSent) {
            return this.utxo.addresses.map(this.formatAddress)
        }
        // If received, get who sent this to us
        else {
            const insUtxos = this.ins.filter((utxo) => {
                return utxo.asset.assetId === this.utxo.asset.assetId
            })
            return insUtxos
                .map((utxo) => utxo.addresses)
                .flat()
                .map(this.formatAddress)
        }
    }
}
</script>
<style scoped lang="scss">
.utxo {
    justify-content: space-between;
}
.addresses {
    p {
        overflow: hidden;
        color: var(--primary-color-light);
        white-space: nowrap;
        font-size: 12px;
        line-height: 12px;
        font-family: monospace;
        text-overflow: ellipsis;
    }

    .address {
        //max-width: 5em;
        word-break: break-all;
        padding-left: 0.5em;
    }
}

.token {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
    color: var(--success);

    &[sent] {
        color: #d04c4c;
    }
}
</style>
