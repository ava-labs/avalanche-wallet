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

@Component
export default class DeleteAccount extends Vue {
    @Prop() setAccount: any
    helpers = this.globalHelper()
    pass = ''
    error = ''

    get canSubmit() {
        if (this.pass.length < 1) return false
        return true
    }

    async submit() {
        this.error = ''
        try {
            let notificationMessage = this.$t('notifications.delete_account')
            await this.$store.dispatch('Accounts/deleteAccount', this.pass)
            this.helpers.setAccount(null)
            this.helpers.dispatchNotification({
                message: notificationMessage,
                type: 'success',
            })
        } catch (err) {
            let error = err as Error
            this.error = error.message
        }
    }
}
</script>
<style scoped lang="scss">
@use './style';
</style>
