<template>
    <modal ref="modal" title="HD Addresses" class="modal_main">
        <div class="hd_deriv_modal_body">
            <HDDerivationList :wallet="wallet"></HDDerivationList>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import HDDerivationList from '@/components/modals/HdDerivationList/HDDerivationList.vue'

@Component({
    components: {
        Modal,
        HDDerivationList,
    },
})
export default class HdDerivationList extends Vue {
    @Prop() wallet!: MnemonicWallet

    open(): void {
        let modal = this.$refs.modal as Modal
        // @ts-ignore
        modal.open()
    }
}
</script>
<style scoped lang="scss">
.hd_deriv_modal_body {
    //width: 600px;
    max-width: 100%;
    padding: 0px;
}
</style>
