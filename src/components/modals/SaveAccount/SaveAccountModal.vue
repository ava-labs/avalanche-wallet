<template>
    <Modal ref="modal" title="Save Account">
        <div class="remember_modal">
            <form @submit.prevent="submit">
                <p>{{ $t('keys.remember_key_desc') }}</p>
                <input v-model="accountName" name="accountName" placeholder="Account Name" />
                <input
                    type="password"
                    :placeholder="$t('keys.export_placeholder1')"
                    v-model="password"
                />
                <input
                    type="password"
                    :placeholder="$t('keys.export_placeholder2')"
                    v-model="password_confirm"
                />
                <p class="err">{{ err }}</p>
                <v-btn
                    class="button_primary"
                    :disabled="!canSubmit"
                    type="submit"
                    :loading="isLoading"
                >
                    {{ $t('keys.remember_key_button') }}
                </v-btn>
            </form>
        </div>
    </Modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '../Modal.vue'
import { SaveAccountInput } from '@/store/types'

@Component({
    components: {
        Modal,
    },
})
export default class SaveAccountModal extends Vue {
    password: string = ''
    password_confirm: string = ''
    isLoading: boolean = false
    err: any = ''
    accountName = ''

    $refs!: {
        modal: Modal
    }

    get canSubmit() {
        if (!this.password) return false
        if (!this.password_confirm) return false
        if (this.accountName.length < 1) {
            this.err = this.$t('keys.account_name_required')
            return false
        }

        if (this.password.length < 9) {
            this.err = this.$t('keys.password_validation')
            return false
        }

        if (this.password !== this.password_confirm) {
            this.err = this.$t('keys.password_validation2')
            return false
        }
        this.err = ''
        return true
    }

    async submit() {
        this.isLoading = true

        let pass = this.password
        let accountName = this.accountName

        let input: SaveAccountInput = {
            accountName: accountName,
            password: pass,
        }
        await this.$store.dispatch('saveAccount', input)
        this.isLoading = false
        this.onsuccess()
        this.close()
    }

    onsuccess() {
        this.clear()
    }

    clear() {
        this.password = ''
        this.password_confirm = ''
        this.accountName = ''
        this.err = ''
    }
    close() {
        this.clear()
        //@ts-ignore
        this.$refs.modal.close()
    }

    open() {
        //@ts-ignore
        this.$refs.modal.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.remember_modal {
    padding: 30px;
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
