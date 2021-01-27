<template>
    <div>
        <label>{{ $t('private_key') }}</label>
        <form @submit.prevent="addKey">
            <qr-input @change="validateQR" v-model="privateKeyInput" class="qrIn"></qr-input>
            <p class="err">{{ error }}</p>
            <v-btn
                type="submit"
                :loading="isLoading"
                :disabled="!canAdd"
                class="addKeyBut button_primary ava_button"
                depressed
                block
            >
                {{ $t('add_pk') }}
            </v-btn>
        </form>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'
// @ts-ignore
import { QrInput } from '@avalabs/vue_components'
import Spinner from '@/components/misc/Spinner.vue'

@Component({
    components: {
        QrInput,
        Spinner,
    },
})
export default class AddKeyString extends Vue {
    privateKeyInput: string = ''
    canAdd: boolean = false
    error: string = ''
    isLoading: boolean = false

    validateQR(val: string) {
        if (this.privateKeyInput.length > 10) {
            this.canAdd = true
        } else if (this.privateKeyInput.length === 0) {
            this.error = ''
            this.canAdd = false
        } else {
            this.canAdd = false
        }
    }

    addKey() {
        this.isLoading = true
        this.error = ''

        setTimeout(async () => {
            try {
                await this.$store.dispatch('addWalletSingleton', this.privateKeyInput)
                // @ts-ignore
                this.$emit('success')
                this.clear()
            } catch (e) {
                this.isLoading = false

                try {
                    if (e.message === 'WALLET ALREADY ADDED') {
                        this.error = 'This private key has already been added to this wallet.'
                    }
                } catch (e) {
                    this.error = 'Invalid Private Key'
                }
            }
        }, 200)
    }

    clear() {
        this.isLoading = false
        this.privateKeyInput = ''
        this.canAdd = false
        this.error = ''
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

label {
    color: #909090;
    font-size: 12px;
}

.qrIn {
    border-radius: 2px !important;
    height: 40px;
    font-size: 12px;
    background-color: #f5f6fa;
}

.err {
    color: var(--error);
}
</style>
