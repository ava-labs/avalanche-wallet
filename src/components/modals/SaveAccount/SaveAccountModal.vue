<template>
    <div>
        <Modal ref="modal" :title="$t('keys.save_account.title')">
            <div class="remember_modal">
                <form @submit.prevent="submit">
                    <div class="flex-row" style="justify-content: center">
                        <Identicon :value="baseAddresses.join('')"></Identicon>
                    </div>
                    <p>{{ $t('keys.save_account.desc') }}</p>

                    <input
                        v-model="accountName"
                        :name="$t('keys.save_account.placeholder_1')"
                        placeholder="Account Name"
                        :disabled="existsInLocalStorage"
                    />
                    <input
                        type="password"
                        :placeholder="$t('keys.save_account.placeholder_2')"
                        v-model="password"
                    />
                    <input
                        type="password"
                        :placeholder="$t('keys.save_account.placeholder_3')"
                        v-model="password_confirm"
                    />
                    <p class="err">{{ err }}</p>
                    <p class="err small" style="text-align: center">
                        Clearing your browser cache will remove this account. Make sure you have
                        your
                        <b>mnemonic phrase</b>
                        or
                        <b>private key</b>
                        saved.
                    </p>
                    <v-btn
                        class="button_primary"
                        :disabled="!canSubmit"
                        type="submit"
                        :loading="isLoading"
                    >
                        {{ $t('keys.save_account.submit') }}
                    </v-btn>
                </form>
            </div>
        </Modal>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

import Modal from '../Modal.vue'
import { SaveAccountInput } from '@/store/types'
import { iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'

@Component({
    components: {
        Identicon,
        Modal,
    },
})
export default class SaveAccountModal extends Vue {
    password: string = ''
    password_confirm: string = ''
    isLoading: boolean = false
    isDestroyed: boolean = false
    err: any = ''
    accountName = ''
    existsInLocalStorage: boolean = false
    index: number = 0
    foundAccount: iUserAccountEncrypted | null = null
    $refs!: {
        modal: Modal
    }

    get canSubmit() {
        if (this.error !== null) return false
        return true
    }

    get error() {
        if (!this.password) return this.$t('keys.password_validation')
        if (!this.password_confirm) return this.$t('keys.password_validation2')
        if (this.accountName.length < 1) return this.$t('keys.account_name_required')
        if (this.password.length < 9) return this.$t('keys.password_validation')
        if (this.password !== this.password_confirm) return this.$t('keys.password_validation2')

        return null
    }

    async submit(): Promise<void> {
        this.isLoading = true
        let pass = this.password
        let accountName = this.accountName

        let input: SaveAccountInput = {
            accountName: accountName,
            password: pass,
        }
        await this.$store.dispatch('Accounts/saveAccount', input)

        this.isLoading = false
        this.onsuccess()
    }

    destroyed() {
        this.isDestroyed = true
    }

    onsuccess() {
        this.$store.dispatch('Notifications/add', {
            title: 'Account Saved',
            message: 'Your keys are now stored under a new local account.',
            type: 'info',
        })
        this.close()
    }

    clear() {
        this.password = ''
        this.password_confirm = ''
        this.accountName = ''
        this.err = ''
    }
    close() {
        this.clear()
        if (!this.isDestroyed) this.$refs.modal.close()
    }

    open() {
        this.$refs.modal.open()
    }

    get baseAddresses(): string[] {
        return this.$store.getters['Accounts/baseAddresses']
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.remember_modal {
    width: 320px;
    max-width: 100%;
    padding: 12px 30px;
}

form {
    display: flex;
    flex-direction: column;

    > * {
        margin: 6px 0px;
    }
}

input {
    background-color: var(--bg-light);
    color: var(--primary-color);
    padding: 6px 14px;
}

.cancel_but {
    color: #999;
    font-size: 0.9rem;
}

.password {
    background-color: var(--bg-light);
    color: var(--primary-color);
    padding: 6px 14px;
}

.submit {
    margin-top: 30px;
}

.err {
    color: var(--error);
}
</style>
