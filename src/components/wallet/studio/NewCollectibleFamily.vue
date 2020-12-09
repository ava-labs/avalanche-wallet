<template>
    <div class="new_family">
        <div>
            <p>Create a new Collectible family.</p>
            <form @submit.prevent="submit">
                <div style="display: flex">
                    <div>
                        <label>Name</label>
                        <input type="text" placeholder="Name" v-model="name" />
                    </div>
                    <div class="symbol">
                        <label>Symbol</label>
                        <input type="text" placeholder="xxxx" v-model="symbol" />
                    </div>
                </div>

                <div>
                    <label>Number of Groups</label>
                    <p>You will get to mint each group after you create a family.</p>
                    <input
                        type="number"
                        placeholder="Name of the Collection"
                        min="1"
                        max="1024"
                        v-model="groupNum"
                    />
                </div>
                <div>
                    <p>Fee: {{ txFee.toLocaleString() }} AVAX</p>
                </div>
                <v-btn :loading="isLoading" type="submit" class="button_secondary" small>
                    Create
                </v-btn>
            </form>
        </div>
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
<style scoped lang="scss">
.new_family {
    //display: grid;
    //grid-template-columns: 1fr 350px;
}
form > div {
    margin: 24px 0;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

input {
    display: block;
    background-color: var(--bg-light);
    color: var(--primary-color);
    padding: 6px 14px;
    font-size: 13px;
}

.symbol {
    margin-left: 12px;
    > input {
        width: 60px;
        text-align: center;
    }
}

.groups {
    //display: grid;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    //grid-template-columns: repeat(5, 1fr);

    > div {
        margin: 4px;
        background-color: var(--bg-light);
        width: 45px;
        height: 45px;
    }
}
</style>
