<template>
    <modal ref="modal" :title="$t('modal.keystore.title')" class="modal_main" :can_close="false">
        <div class="update_keystore_modal_body">
            <p>{{ $t('modal.keystore.desc') }}</p>
            <ExportWallet
                v-if="!isSuccess"
                @success="success"
                :is-desc="false"
                class="export_wallet"
                ref="export"
                :wallets="allWallets"
            ></ExportWallet>
            <v-btn v-else class="ava_button button_primary" @click="logout">
                {{ $t('modal.keystore.logout') }}
            </v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import ExportWallet from '@/components/wallet/manage/ExportWallet.vue'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'

@Component({
    components: {
        Modal,
        ExportWallet,
    },
})
export default class MnemonicPhrase extends Vue {
    isSuccess: boolean = false

    $refs!: {
        export: ExportWallet
        modal: Modal
    }

    @Prop({ default: '' }) phrase!: string

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    mounted() {
        this.open()
    }

    success() {
        this.$refs.export.clear()
        this.isSuccess = true
    }

    logout() {
        this.$store.dispatch('logout')
    }

    get allWallets(): MnemonicWallet[] {
        return this.$store.state.wallets
    }
}
</script>
<style scoped lang="scss">
.update_keystore_modal_body {
    /*width: 600px;*/
    width: 400px;
    max-width: 100%;
    padding: 30px;
    /*background-color: var(--bg-light);*/
}

.export_wallet {
    margin: 30px 0;
}

.ava_button {
    display: block;
    margin: 10px auto !important;
}
</style>
