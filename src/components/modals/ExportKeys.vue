<template>
    <modal ref="modal" :title="title">
        <div class="export_body">
            <p class="selection_num">
                {{ $t('keys.export_key_info', [wallets.length]) }}
            </p>
            <export-wallet
                @success="handleExportSuccess"
                :wallets="wallets"
            ></export-wallet>
        </div>
    </modal>
</template>

<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import ExportWallet from '@/components/wallet/manage/ExportWallet.vue'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'

@Component({
    components: {
        Modal,
        ExportWallet,
    },
})
export default class ExportKeys extends Vue {
    isActive: boolean = false
    title: string = 'Export Keys'

    @Prop() wallets!: AvaHdWallet[]

    open() {
        // @ts-ignore
        this.$refs.modal.open()
    }

    close() {
        this.isActive = false
    }

    handleExportSuccess() {
        // @ts-ignore
        this.$refs.modal.close()
        this.close()
    }
}
</script>

<style scoped lang="scss">
@use '../../main';

.export_body {
    padding: 30px;
    width: 450px;
    min-height: 315px;
}

.selection_num {
    color: var(--primary-color);
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    padding-bottom: 14px;
}

.explain {
    text-align: center;
}

@include main.mobile-device {
    .export_body {
        width: 90vw;
    }
}
</style>

<style lang="scss">
@use '../../main';

.v-tab.v-tab {
    font-weight: 700;
}

.v-tabs-slider-wrapper {
    color: main.$secondary-color;
    caret-color: main.$secondary-color;
    height: 3px !important;
}
</style>
