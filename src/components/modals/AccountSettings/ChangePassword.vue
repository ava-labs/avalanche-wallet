<template>
    <form @submit.prevent="submit" class="change_pass_form">
        <input
            placeholder="Old Password"
            type="password"
            class="single_line_input"
            v-model="passOld"
        />
        <input
            placeholder="New Password"
            type="password"
            class="single_line_input"
            v-model="pass"
        />
        <input
            placeholder="Confirm Password"
            type="password"
            class="single_line_input"
            v-model="passConfirm"
        />
        <p class="err">{{ error }}</p>
        <v-btn class="button_secondary" small block depressed :disabled="!canSubmit" type="submit">
            Submit
        </v-btn>
    </form>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'
import { ChangePasswordInput } from '@/store/modules/accounts/types'

@Component
export default class ChangePassword extends Vue {
    pass = ''
    passOld = ''
    passConfirm = ''
    error = ''

    $parent!: AccountSettingsModal

    errCheck() {
        if (this.pass.length < 9) {
            return 'Password must be at least 9 characters.'
        }

        if (this.pass != this.passConfirm) {
            return 'Passwords do not match.'
        }

        if (this.pass === this.passOld) {
            return 'Your new password must be different from your previous password.'
        }

        return false
    }

    get canSubmit() {
        if (this.pass.length < 1) return false
        if (this.passConfirm.length < 1) return false
        return true
    }

    async submit() {
        this.error = ''
        let err = this.errCheck()
        if (err) {
            this.error = err
            return
        }

        let input: ChangePasswordInput = {
            passOld: this.passOld,
            passNew: this.pass,
        }

        this.$store
            .dispatch('Accounts/changePassword', input)
            .then(() => {
                this.$store.dispatch('Notifications/add', {
                    title: 'Password Changed',
                    message: 'You can now use your account with your new password.',
                })
                this.$parent.close()
            })
            .catch((err) => {
                this.error = err
            })
    }
}
</script>
<style scoped lang="scss">
@use './style';
</style>
