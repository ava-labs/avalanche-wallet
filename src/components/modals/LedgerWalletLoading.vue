<template>
    <modal ref="modal" title="Loading Wallet" :can_close="false">
        <div class="ledger_loading_body">
            <Spinner style="font-size: 1.5em; margin-bottom: 1em"></Spinner>
            <p>Please wait while we load your wallet information.</p>
        </div>
    </modal>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import Spinner from '@/components/misc/Spinner.vue'
@Component({
    components: { Spinner, Modal },
})
export default class LedgerWalletLoading extends Vue {
    $refs!: {
        modal: Modal
    }
    get isActive() {
        return this.$store.state.Ledger.isWalletLoading
    }

    mounted() {
        if (this.isActive) {
            this.$refs.modal.open()
        }
    }

    @Watch('isActive', { immediate: true })
    onActive(val: boolean): void {
        if (!this.$refs.modal) return
        if (val) {
            this.$refs.modal.open()
        } else {
            this.$refs.modal.close()
        }
    }
}
</script>
<style scoped lang="scss">
.ledger_loading_body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px;
}
</style>
