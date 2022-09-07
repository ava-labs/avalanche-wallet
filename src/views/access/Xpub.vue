<template>
    <div class="access_card">
        <div class="content">
            <h1>XPUB (Readonly)</h1>
            <p class="desc">Show AVAX balances.</p>
            <form @submit.prevent="access">
                <p class="_label">X & P-Chain Extended Public Key</p>
                <v-text-field
                    class="pass"
                    label="xpub..."
                    dense
                    solo
                    flat
                    type="password"
                    v-model="xpubXP"
                    hide-details
                ></v-text-field>
                <p class="_label">C-Chain Address</p>
                <v-text-field
                    class="pass"
                    label="0x..."
                    dense
                    solo
                    flat
                    v-model="evmAddr"
                    hide-details
                ></v-text-field>
                <p class="err">{{ error }}</p>

                <v-btn
                    class="ava_button button_primary"
                    @click="access"
                    :loading="isLoading"
                    :disabled="!canSubmit"
                    depressed
                >
                    View Wallet Balances
                </v-btn>
            </form>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import Form from '@/components/wallet/earn/ChainTransfer/Form.vue'
import { PublicMnemonicWallet, getEthAddressKeyFromAccountKey } from '@avalabs/avalanche-wallet-sdk'
import WalletReadonly from '@/views/WalletReadonly.vue'
import { ethers } from 'ethers'

@Component({
    components: { WalletReadonly, Form },
})
export default class Xpub extends Vue {
    xpubXP = ''
    evmAddr = ''
    xpubC = ''
    isLoading = false
    error = ''
    wallet: PublicMnemonicWallet | null = null

    get canSubmit() {
        return this.xpubXP.length > 10 && this.evmAddr.length > 9
    }

    access() {
        try {
            ethers.utils.getAddress(this.evmAddr)
        } catch (e) {
            this.error = ' Invalid evm address'
            return
        }

        try {
            // Not using real xpub for EVM, instead getting C balance
            // directly from network
            const wallet = new PublicMnemonicWallet(this.xpubXP, this.xpubXP)
            this.$router.push({
                name: 'wallet_readonly',
                params: {
                    //@ts-ignore
                    wallet: wallet,
                    evmAddress: this.evmAddr,
                },
            })
        } catch (e) {
            this.error = 'Invalid XPUB key.'
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

h1 {
    font-size: main.$m-size;
    font-weight: 400;
}
.pass {
    background-color: var(--bg) !important;
}

.desc {
    font-size: 0.9em;
    color: var(--primary-color-light);
    //margin-bottom: 30px !important;
}

.content {
    width: 460px;
    max-width: 100%;
    margin: 0px auto;
    padding: 2em;
    background-color: var(--bg-light);
}
._label {
    margin-top: 1em !important;
    font-size: 0.9em;
    text-align: left !important;
}

.ava_button {
    width: 100%;
    margin-top: 22px;
}
</style>
