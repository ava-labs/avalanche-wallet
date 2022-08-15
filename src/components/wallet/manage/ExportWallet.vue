<template>
    <div class="export_wallet">
        <p v-if="isDesc" class="explain">{{ $t('keys.export_key_desc') }}</p>
        <form @submit.prevent="download">
            <label>Password (min 9 characters)</label>
            <v-text-field
                type="password"
                placeholder="Password"
                v-model="pass"
                hide-details
                outlined
                dense
                class="formIn"
                height="40"
            ></v-text-field>
            <label>Confirm Password</label>
            <v-text-field
                type="password"
                placeholder="Confirm Password"
                v-model="passConfirm"
                hide-details
                outlined
                dense
                class="formIn"
                height="40"
            ></v-text-field>
            <p class="err">{{ err }}</p>
            <v-btn
                type="submit"
                :disabled="!isValid"
                :loading="isLoading"
                depressed
                block
                class="button_primary"
            >
                Export Wallet
            </v-btn>
        </form>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { ExportWalletsInput } from '@/store/types'

@Component
export default class ExportWallet extends Vue {
    isLoading: boolean = false
    pass: string = ''
    passConfirm: string = ''
    err: string = ''

    @Prop() wallets!: MnemonicWallet[]
    @Prop({ default: true }) isDesc!: boolean

    get isValid(): boolean {
        return this.pass.length >= 9 && this.pass === this.passConfirm ? true : false
    }

    clear() {
        this.isLoading = false
        this.pass = ''
        this.passConfirm = ''
        this.err = ''
    }

    async download() {
        this.isLoading = true
        this.err = ''

        if (!this.wallets) {
            this.isLoading = false
            this.err = 'No wallet selected.'
            return
        }

        let input: ExportWalletsInput = {
            password: this.pass,
            wallets: this.wallets,
        }
        setTimeout(() => {
            this.$store.dispatch('exportWallets', input).then((res) => {
                this.isLoading = false
                this.pass = ''
                this.passConfirm = ''
                this.$store.dispatch('Notifications/add', {
                    title: 'Key File Export',
                    message: 'Your keys are downloaded.',
                })
                // @ts-ignore
                this.$emit('success')
            })
        }, 200)
    }
}
</script>
<style lang="scss">
.export_wallet {
    .formIn {
        .v-input__slot {
            background-color: var(--bg-light) !important;
        }

        .v-text-field__details {
            padding: 0;
        }

        fieldset {
            border: none;
        }
    }
}
</style>
<style lang="scss">
.export_wallet {
    fieldset {
        border: none !important;
    }
}
</style>
<style scoped lang="scss">
@use '../../../styles/main';

.export_wallet {
    font-size: 12px;
}
.explain {
    color: var(--primary-color-light);
    margin-bottom: 20px !important;
}

label {
    color: var(--primary-color-light);
}

.formIn {
    background-color: var(--bg-light);
    font-size: 12px;
    border-radius: 2px;
}

.button_primary {
    margin-top: 10px;
}

.err {
    margin: 4px 0 !important;
    color: var(--error);
}
</style>
