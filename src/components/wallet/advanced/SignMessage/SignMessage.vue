<template>
    <div>
        <h2>{{ $t('advanced.sign.title') }}</h2>
        <p style="margin-bottom: 14px !important">
            {{ $t('advanced.sign.desc') }}
        </p>
        <div v-if="isHD">
            <label>{{ $t('advanced.sign.label1') }}</label>
            <SearchAddress :wallet="wallet" v-model="sourceAddress"></SearchAddress>
        </div>
        <div>
            <label>{{ $t('advanced.sign.label2') }}</label>
            <p class="warn">{{ $t('advanced.sign.warn') }}</p>
            <textarea v-model="message"></textarea>
        </div>
        <p class="err">{{ error }}</p>
        <v-btn class="button_secondary" block small depressed @click="sign" :disabled="!canSubmit">
            {{ $t('advanced.sign.submit') }}
        </v-btn>

        <div v-if="signed" class="result">
            <label>{{ $t('advanced.sign.label3') }}</label>
            <p class="signed">{{ signed }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { WalletType } from '@/js/wallets/types'
import SearchAddress from '@/components/wallet/advanced/SignMessage/SearchAddress.vue'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
@Component({
    components: { SearchAddress },
})
export default class SignMessage extends Vue {
    sourceAddress = null
    message = ''
    signed = ''
    error = ''

    get wallet(): WalletType {
        return this.$store.state.activeWallet
    }

    async sign() {
        this.error = ''
        try {
            // Convert the message to a hashed buffer
            // let hashMsg = this.msgToHash(this.message);
            if (this.wallet.type === 'singleton') {
                this.signed = await (this.wallet as SingletonWallet).signMessage(this.message)
            } else {
                this.signed = await this.wallet.signMessage(this.message, this.sourceAddress!)
            }
        } catch (e) {
            this.error = e
        }
    }

    clear() {
        this.message = ''
        this.signed = ''
        this.error = ''
    }

    deactivated() {
        this.clear()
    }

    get isHD() {
        return this.wallet.type !== 'singleton'
    }

    get canSubmit(): boolean {
        if (!this.sourceAddress && this.isHD) return false
        if (!this.message) return false

        return true
    }
}
</script>
<style scoped lang="scss">
select,
textarea,
.signed {
    padding: 6px 12px;
    background-color: rgba(0, 0, 0, 0.1);
}
select {
    outline: none;
    width: 100%;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 13px;

    &:hover {
        color: var(--primary-color);
    }
}

option {
    background-color: var(--bg-wallet);
}

label {
    display: block;
    text-align: left;
    color: var(--primary-color-light);
    font-size: 12px;
    margin-bottom: 20px;
    margin-top: 6px;
}

textarea {
    width: 100%;
    resize: none;
    font-size: 13px;
    padding: 6px 12px;
    height: 80px;
}

.signed {
    word-break: break-all;
    font-size: 12px;
}

.warn {
    font-size: 12px;
    color: var(--secondary-color);
}

.result {
    margin-top: 6px;
}
</style>
