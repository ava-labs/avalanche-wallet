<template>
    <modal
        ref="modal"
        :title="$t('modal.multisig.title')"
        :subtitle="$t('modal.multisig.subtitle', { n: name, t: threshold })"
        class="modal_main"
    >
        <div class="modal-body">
            <h3 class="label">Linked Owners</h3>
            <multisig-owner-row
                v-for="wallet in wallets"
                :wallet="wallet"
                :key="wallet.id"
                class="msig_row"
            ></multisig-owner-row>
            <template v-if="unlinkedOwners.length > 0">
                <hr />
                <h3 class="label">Unlinked Owners</h3>
                <multisig-owner-row
                    v-for="owner in unlinkedOwners"
                    :unlinkedAddress="owner"
                    :key="owner"
                    class="msig_row"
                ></multisig-owner-row>
            </template>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import { MultisigWallet } from '@/js/wallets/MultisigWallet'
import MultisigOwnerRow from '@/components/wallet/manage/MultisigOwnerRow.vue'

@Component({
    components: {
        Modal,
        MultisigOwnerRow,
    },
})
export default class MultisigOwnersModal extends Vue {
    @Prop() wallet!: MultisigWallet

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    get wallets() {
        return this.wallet.wallets
    }

    get unlinkedOwners() {
        return this.wallet.getUnlinkedOwners()
    }

    get threshold() {
        return this.wallet.keyData.owner.threshold
    }

    get name() {
        return this.wallet.name
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/abstracts/mixins';

.label {
    color: #9999;
}

.modal-body {
    background-color: var(--bg);
    max-width: fit-content;
    width: 100%;
    max-height: 90%;
    padding: 0px 15px;

    h3 {
        margin-top: 15px;
    }
}

.msig_row {
    background-color: var(--bg-light);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    transition-duration: 0.2s;
}

@include mixins.mobile-device {
    .modal-body {
        max-width: 100%;
    }
}
</style>
