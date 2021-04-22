<template>
    <form @submit.prevent="submit">
        <p>You have unsaved keys on your account.</p>
        <input type="password" class="single_line_input" placeholder="Password" v-model="pass" />
        <p class="err">{{ error }}</p>
        <v-btn class="button_secondary" small block depressed :disabled="!canSubmit" type="submit">
            Submit
        </v-btn>
    </form>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class SaveKeys extends Vue {
    pass = ''
    error = ''

    get canSubmit() {
        if (this.pass.length < 1) return false
        return true
    }

    submit() {
        this.$store
            .dispatch('Accounts/saveKeys', this.pass)
            .then((res) => {
                this.$store.dispatch('Notifications/add', {
                    title: 'Keys Saved',
                    message: 'Your account is updated with new keys.',
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

p {
    white-space: normal;
}
</style>
