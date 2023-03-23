<template>
    <form @submit.prevent="submit">
        <p>You have unsaved keys on your account.</p>
        <input class="pass_name" :value="accountName" />
        <input type="password" class="single_line_input" placeholder="Password" v-model="pass" />
        <p class="err">{{ error }}</p>
        <v-btn class="button_secondary" small block depressed :disabled="!canSubmit" type="submit">
            Submit
        </v-btn>
    </form>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'

@Component
export default class SaveKeys extends Vue {
    @Prop() accountName!: string
    pass = ''
    error = ''

    $parent!: AccountSettingsModal

    get canSubmit() {
        if (this.pass.length < 1) return false
        return true
    }

    submit() {
        this.error = ''
        this.$store
            .dispatch('Accounts/saveKeys', this.pass)
            .then((res) => {
                let { dispatchNotification } = this.globalHelper()
                dispatchNotification({
                    message: this.$t('notifications.save_keys'),
                    type: 'success',
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

p {
    white-space: normal;
}
</style>
