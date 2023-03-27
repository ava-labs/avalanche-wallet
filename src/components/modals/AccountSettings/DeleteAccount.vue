<template>
    <form @submit.prevent="submit">
        <input class="single_line_input" type="password" v-model="pass" placeholder="Password" />
        <p class="err">{{ error }}</p>
        <v-btn class="button_secondary" :disabled="!canSubmit" depressed block small type="submit">
            Delete
        </v-btn>
    </form>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'

@Component
export default class DeleteAccount extends Vue {
    @Prop() setAccount: any
    pass = ''
    error = ''
    $parent!: AccountSettingsModal

    get canSubmit() {
        if (this.pass.length < 1) return false
        return true
    }

    async submit() {
        this.error = ''
        try {
            let notificationMessage = this.$t('notifications.delete_account')
            await this.$store.dispatch('Accounts/deleteAccount', this.pass)
            let { dispatchNotification, setAccount } = this.globalHelper()
            setAccount(null)
            dispatchNotification({
                message: notificationMessage,
                type: 'success',
            })
            this.$parent.close()
        } catch (err: any) {
            console.error(err)
            this.error = err.message
        }
    }
}
</script>
<style scoped lang="scss">
@use './style';
</style>
