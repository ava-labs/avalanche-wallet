<template>
    <div class="new_family">
        <div>
            <p>Create a new Collectible family.</p>
            <form @submit.prevent="submit" v-if="!isSuccess">
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
            <div class="success_cont" v-if="isSuccess">
                <p>Created NFT Family</p>
                <div>
                    <label>Tx ID</label>
                    <p>{{ txId }}</p>
                </div>
            </div>
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
    isSuccess = false
    error = ''
    txId = ''

    get txFee(): Big {
        return bnToBig(pChain.getTxFee(), 9)
    }

    async submit() {
        let wallet = this.$store.state.activeWallet
        if (!wallet) return

        this.error = ''
        this.isLoading = true
        try {
            let txId = await wallet.createNftFamily(this.name, this.symbol, this.groupNum)
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e)
        }
    }

    onError(e: any) {
        this.error = ''
        console.error(e)
        this.isLoading = false
    }
    onSuccess(txId: string) {
        this.isLoading = false
        this.isSuccess = true
        this.txId = txId
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
