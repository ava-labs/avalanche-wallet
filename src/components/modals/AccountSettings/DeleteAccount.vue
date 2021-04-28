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
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class DeleteAccount extends Vue {
    pass = ''
    error = ''

    get canSubmit() {
        if (this.pass.length < 1) return false
        return true
    }

    async submit() {
        this.error = ''
        await this.$store
            .dispatch('Accounts/deleteAccount', this.pass)
            .then((res) => {
                this.$store.dispatch('Notifications/add', {
                    title: 'Account Deleted',
                    message: 'Your wallet is no longer stored on this browser.',
                })
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
