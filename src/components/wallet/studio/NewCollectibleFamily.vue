<template>
    <div class="new_family">
        <div>
            <p>{{ $t('studio.family.desc') }}</p>
            <form @submit.prevent="submit" v-if="!isSuccess">
                <div style="display: flex">
                    <div style="flex-grow: 1">
                        <label>{{ $t('studio.family.label1') }}</label>
                        <input
                            type="text"
                            placeholder="Name"
                            v-model="name"
                            style="width: 100%"
                            maxlength="128"
                        />
                    </div>
                    <div class="symbol">
                        <label>{{ $t('studio.family.label2') }}</label>
                        <input
                            type="text"
                            placeholder="xxxx"
                            v-model="symbol"
                            max="4"
                            maxlength="4"
                        />
                    </div>
                </div>

                <div>
                    <label>{{ $t('studio.family.label3') }}</label>
                    <input
                        type="number"
                        placeholder="Name of the Collection"
                        min="1"
                        max="1024"
                        v-model="groupNum"
                    />
                </div>
                <div>
                    <p>
                        {{ $t('studio.family.fee') }}: {{ txFee.toLocaleString() }}
                        {{ nativeAssetSymbol }}
                    </p>
                </div>
                <p v-if="error" class="err">{{ error }}</p>
                <v-btn :loading="isLoading" type="submit" class="button_secondary" small>
                    {{ $t('studio.family.submit') }}
                </v-btn>
            </form>
            <div class="success_cont" v-if="isSuccess">
                <p style="color: var(--success); margin: 12px 0 !important">
                    <fa icon="check-circle"></fa>
                    {{ $t('studio.family.success.desc') }}
                </p>
                <div>
                    <label>{{ $t('studio.family.success.label1') }}</label>
                    <p style="word-break: break-all">{{ txId }}</p>
                </div>
                <div>
                    <label>{{ $t('studio.family.success.label2') }}</label>
                    <p>{{ name }}</p>
                </div>
                <div>
                    <label>{{ $t('studio.family.success.label3') }}</label>
                    <p>{{ symbol }}</p>
                </div>
                <div>
                    <label>{{ $t('studio.family.success.label4') }}</label>
                    <p>{{ groupNum }}</p>
                </div>
                <v-btn class="button_secondary" small @click="cancel" depressed>
                    {{ $t('studio.family.back') }}
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { ava } from '@/AVA'
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

    @Watch('symbol')
    onSymbolChange(val: string) {
        let newVal = val.toUpperCase()
        // Remove numbers
        newVal = newVal.replace(/[0-9]/g, '')
        this.symbol = newVal
    }

    get txFee(): Big {
        return bnToBig(ava.PChain().getCreationTxFee(), 9)
    }

    validate(): boolean {
        if (this.symbol.length === 0) {
            this.error = 'You must provide a symbol.'
            return false
        } else if (this.symbol.length > 4) {
            this.error = 'Symbol must be 4 characters max.'
            return false
        } else if (this.groupNum < 1) {
            this.error = 'Number of groups must be at least 1.'
            return false
        }
        return true
    }
    async submit() {
        if (!this.validate()) {
            return
        }
        let wallet = this.$store.state.activeWallet
        if (!wallet) return

        this.error = ''
        this.isLoading = true

        let nameTrimmed = this.name.trim()
        let symbolTrimmed = this.symbol.trim()

        try {
            let txId = await wallet.createNftFamily(nameTrimmed, symbolTrimmed, this.groupNum)
            console.log(txId)
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e)
        }
    }

    cancel() {
        this.$emit('cancel')
    }

    onError(e: any) {
        this.error = e
        console.error(e)
        this.isLoading = false
    }

    onSuccess(txId: string) {
        this.isLoading = false
        this.isSuccess = true
        this.txId = txId

        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Success',
            message: 'Collectible family created.',
        })

        setTimeout(() => {
            this.$store.dispatch('Assets/updateUTXOs')
            this.$store.dispatch('History/updateTransactionHistory')
        }, 3000)
    }

    get mintUtxos() {
        // return this.$store.getters.walletNftMintUTXOs
        return this.$store.state.Assets.nftMintUTXOs
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
.new_family {
    max-width: 100%;
    width: 340px;
    //display: grid;
    //grid-template-columns: 1fr 350px;
}
form > div {
    margin: 12px 0;
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

.success_cont {
    > div {
        padding: 3px 12px;
        margin-bottom: 5px;
        background-color: var(--bg-light);
    }

    .v-btn {
        margin-top: 12px;
    }
}
</style>
