<template>
    <Modal title="Wallet UTXO Breakdown" ref="modal">
        <div class="utxos_breakdown_body">
            <div class="tabs">
                <button @click="chain = 'X'">X</button>
                <button @click="chain = 'P'">P</button>
            </div>
            <div class="scrollable">
                <div style="height: 90px">
                    <table>
                        <thead>
                            <tr>
                                <th class="col_id">ID</th>
                                <th>Type</th>
                                <th>Locktime</th>
                                <th>Threshold</th>
                                <th>Owners</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-show="chain === 'X'">
                                <UTXORow
                                    v-for="utxo in avmUTXOs"
                                    :key="utxo.getUTXOID()"
                                    :utxo="utxo"
                                ></UTXORow>
                            </template>
                            <template v-show="chain === 'P'">hi</template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </Modal>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import { WalletType } from '@/store/types'
import { UTXOSet as AVMUTXOSet, UTXO as AVMUTXO } from 'avalanche/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet, UTXO as PlatformUTXO } from 'avalanche/dist/apis/platformvm'
import UTXORow from '@/components/modals/UtxosBreakdown/AVMUTXORow.vue'

@Component({
    components: { UTXORow, Modal },
})
export default class UtxosBreakdownModal extends Vue {
    chain = 'P'

    $refs!: {
        modal: Modal
    }
    open(): void {
        let modal = this.$refs.modal as Modal
        //@ts-ignore
        modal.open()
    }
    get wallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get avmUTXOs(): AVMUTXO[] {
        return this.wallet!.getUTXOSet().getAllUTXOs()
    }

    get platformUTXOs(): PlatformUTXO[] {
        return this.wallet!.getPlatformUTXOSet().getAllUTXOs()
    }
}
</script>
<style scoped lang="scss">
.utxos_breakdown_body {
    width: 90vw;
    height: 80vh;
    max-width: 1500px;
    display: grid;
    grid-template-rows: max-content 1fr;
}

.scrollable {
    height: 100%;
    overflow: scroll;
}
table {
    width: 100%;
    height: 460px;
    overflow: scroll;
}
th {
    font-size: 13px;
    font-weight: bold;
}

.tabs {
    > button {
        padding: 12px 24px;
    }
}
</style>

<style lang="scss">
.utxos_breakdown_body {
    .col_id {
        padding-left: 12px !important;
    }
}
</style>
