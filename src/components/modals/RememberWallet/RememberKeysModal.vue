<template>
    <Modal ref="modal" title="Remember Keys">
        <div class="remember_modal">
            <form @submit.prevent="submit">
                <p>{{ $t('keys.remember_key_desc') }}</p>
                <RememberKey
                    v-model="rememberPass"
                    @checked="isChecked"
                    @is-valid="isVolatileRememberValid"
                    ref="rememberForm"
                ></RememberKey>
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
import RememberKey from '@/components/misc/RememberKey.vue'

@Component({
    components: {
        Modal,
        RememberKey,
    },
})
export default class RememberWalletModal extends Vue {
    rememberPass: string = ''
    rememberPassValid: boolean = false
    rememberChecked: boolean = false
    password: string = ''
    isLoading: boolean = false
    err: string = ''

    $refs!: {
        //@ts-ignore
        rememberForm: RememberKey
    }

    get canSubmit() {
        if (!this.rememberPass) return false
        if (!this.rememberChecked) return false
        if (!this.rememberPassValid) return false
        return true
    }

    isChecked(val: boolean) {
        this.rememberChecked = val
    }

    isVolatileRememberValid(val: boolean) {
        this.rememberPassValid = val
    }

    async submit() {
        this.isLoading = true

        let pass = this.rememberPass
        await this.$store.dispatch('rememberWallets', pass)
        this.isLoading = false
        this.onsuccess()
        this.close()
    }

    onsuccess() {
        this.clear()
        // @ts-ignore
        this.$refs.rememberForm.clear()
    }

    clear() {
        this.rememberChecked = false
        this.rememberPass = ''
        this.rememberPassValid = false
        this.password = ''
    }
    close() {
        this.clear()
        // @ts-ignore
        this.$refs.rememberForm.clear()
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
