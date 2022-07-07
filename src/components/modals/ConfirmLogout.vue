<template>
    <modal ref="modal" title="Confirm Logout" class="modal_main" :can_close="false">
        <div class="confirm_body">
            <p style="text-align: center">
                {{ $t('logout.confirmation') }}
            </p>

            <div
                style="display: flex; flex-direction: column; align-items: center; margin-top: 14px"
            >
                <v-btn class="ava_button button_primary" @click="submit" :loading="isLoading">
                    {{ $t('logout.button_conf') }}
                </v-btn>
                <button class="ava_button_secondary" @click="close">
                    {{ $t('logout.button_cancel') }}
                </button>
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'

@Component({
    components: {
        Modal,
    },
})
export default class ConfirmLogout extends Vue {
    isLoading = false
    isDestroyed = false
    @Prop({ default: '' }) phrase!: string

    destroyed() {
        this.isDestroyed = true
    }

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    close(): void {
        let modal = this.$refs.modal as Modal
        modal.close()
    }

    async submit() {
        this.isLoading = true
        await this.$store.dispatch('logout')
        await this.$store.dispatch('Notifications/add', {
            title: 'Logout',
            message: 'You have successfully logged out of your wallet.',
        })
        this.isLoading = false
        if (!this.isDestroyed) this.close()
    }
}
</script>
<style scoped lang="scss">
.confirm_body {
    /*width: 600px;*/
    width: 400px;
    max-width: 100%;
    padding: 30px;
    /*background-color: var(--bg-light);*/
}
</style>
