<template>
    <div>
        <p>Create a new Collectible family.</p>
        <form @submit.prevent="submit">
            <div>
                <label>Name</label>
                <input type="text" placeholder="Name of the Collection" v-model="name" />
            </div>
            <div>
                <label>Symbol</label>
                <input type="text" placeholder="Name of the Collection" v-model="symbol" />
            </div>
            <div>
                <label>Number of Groups</label>
                <input
                    type="number"
                    placeholder="Name of the Collection"
                    min="1"
                    v-model="groupNum"
                />
            </div>
            <div>
                <p>Fee: {{ txFee.toLocaleString() }} AVAX</p>
            </div>
            <v-btn :loading="isLoading" type="submit">Create</v-btn>
        </form>
        {{ mintUtxos.length }}
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { BN } from 'avalanche'
import { pChain } from '@/AVA'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'

@Component
export default class NewCollectibleFamily extends Vue {
    name: string = ''
    symbol: string = ''
    groupNum = 1
    isLoading = false

    get txFee(): Big {
        return bnToBig(pChain.getTxFee(), 9)
    }

    async submit() {
        let wallet = this.$store.state.activeWallet
        if (!wallet) return

        this.isLoading = true
        await wallet.createNftFamily(this.name, this.symbol, this.groupNum)
        this.isLoading = false
    }

    get mintUtxos() {
        return this.$store.getters.walletNftMintUTXOs
    }
}
</script>
