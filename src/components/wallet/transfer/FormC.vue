<template>
    <div class="cols">
        <div class="form">
            <div>
                <label>Amount</label>
                <AvaxInput :max="maxAmt" v-model="amountIn"></AvaxInput>
            </div>

            <div class="gas_cont">
                <div>
                    <label>Gas Price (GWEI)</label>
                    <input type="number" v-model="gasPrice" min="0" />
                </div>
                <div>
                    <label>Gas Limit</label>
                    <input type="number" v-model="gasLimit" min="0" />
                </div>
            </div>
        </div>
        <div></div>
        <div>
            <label>{{ $t('transfer.to') }}</label>
            <qr-input
                v-if="!isConfirm"
                v-model="addressIn"
                class="qrIn"
                placeholder="xxx"
            ></qr-input>
            <v-btn class="button_secondary" depressed block @click="confirm"
                >Confirm</v-btn
            >
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import AvaxInput from '@/components/misc/AvaxInput.vue'
import { WalletType } from '@/store/types'
// @ts-ignore
import { QrInput } from '@avalabs/vue_components'
import Big from 'big.js'
import { BN } from 'avalanche'

@Component({
    components: {
        AvaxInput,
        QrInput,
    },
})
export default class FormC extends Vue {
    isConfirm = false
    addressIn = ''
    amountIn = new BN(0)
    gasPrice = 470
    gasLimit = 21000
    get wallet(): WalletType {
        return this.$store.state.activeWallet
    }

    get rawBalance() {
        return this.wallet.ethBalance
    }
    get balance() {
        let bal = this.rawBalance
        return bal.divRound(new BN(Math.pow(10, 9).toString()))
    }

    get txFee() {
        return Big(3)
    }

    // balance - (gas * price)
    get maxAmt() {
        let priceWei = new BN(this.gasPrice).mul(new BN(Math.pow(10, 9)))
        let res = priceWei.mul(new BN(this.gasLimit))
        res = this.rawBalance.sub(res)
        return res.divRound(new BN(Math.pow(10, 9)))
    }

    confirm() {
        this.submit()
    }

    submit() {
        let formAmt = this.amountIn.mul(new BN(Math.pow(10, 9)))

        //@ts-ignore
        this.wallet.sendEth(
            this.addressIn,
            formAmt,
            this.gasPrice,
            this.gasLimit
        )
    }
}
</script>
<style scoped lang="scss">
.cols {
    display: grid;
    grid-template-columns: 1fr 1fr 300px;
    column-gap: 45px;
    padding-top: 15px;
}

.form {
    > div {
        margin: 12px 0;
    }
}

input {
    background-color: var(--bg-light);
    padding: 6px 12px;
    color: var(--primary-color);
    font-size: 14px;
}
.gas_cont {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 14px;
}

label {
    font-size: 13px;
    color: var(--primary-color-light);
}
</style>
