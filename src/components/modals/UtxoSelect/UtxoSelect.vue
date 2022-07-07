<template>
    <modal ref="modal" :title="$t('modal.utxo_select.title')" class="modal_main">
        <div class="utxo_select_modal_body">
            <p>{{ $t('modal.utxo_select.desc') }}</p>
            <div class="table_cont">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                            <th class="col_date">
                                {{ $t('modal.utxo_select.col1') }}
                            </th>
                            <th class="col_amt">
                                {{ $t('modal.utxo_select.col2') }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <UtxoRow
                            v-for="utxo in allSorted"
                            :key="utxo.getUTXOID()"
                            :utxo="utxo"
                            @add="addUtxo(utxo)"
                            @remove="removeUtxo(utxo)"
                        ></UtxoRow>
                    </tbody>
                </table>
            </div>
            <div class="tot">
                <label>{{ $t('modal.utxo_select.available') }}</label>
                <p>{{ selectedBalanceText }} {{ nativeAssetSymbol }}</p>
            </div>
            <v-btn class="button_secondary" block depressed small @click="close">
                {{ $t('modal.utxo_select.submit') }}
            </v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Model } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import {
    AmountOutput,
    PlatformVMConstants,
    SECPTransferOutput,
    StakeableLockOut,
    UTXO,
    UTXOSet,
} from '@c4tplatform/camino/dist/apis/platformvm'

import UtxoRow from '@/components/modals/UtxoSelect/UtxoRow.vue'
import { BN } from '@c4tplatform/camino'
import { UnixNow } from '@c4tplatform/camino/dist/utils'
import { bnToBig } from '@/helpers/helper'

@Component({
    components: {
        Modal,
        UtxoRow,
    },
})
export default class UtxoSelect extends Vue {
    @Model('change', { type: Array }) readonly utxos!: UTXO[]
    @Prop() all!: UTXO[]

    customSet = new UTXOSet()

    addUtxo(utxo: UTXO) {
        this.customSet.add(utxo)
        this.$emit('change', this.customSet.getAllUTXOs())
    }

    removeUtxo(utxo: UTXO) {
        this.customSet.remove(utxo)
        this.$emit('change', this.customSet.getAllUTXOs())
    }
    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    close(): void {
        let modal = this.$refs.modal as Modal
        modal.close()
    }

    get allSorted() {
        return this.all.sort((a: UTXO, b: UTXO) => {
            // Sort by Lock status
            let typeA = a.getOutput().getTypeID()
            let typeB = b.getOutput().getTypeID()

            let locktimeA = a.getOutput().getLocktime()
            let locktimeB = a.getOutput().getLocktime()

            if (typeA === PlatformVMConstants.STAKEABLELOCKOUTID) {
                let sLocktime = (a.getOutput() as StakeableLockOut).getStakeableLocktime()
                locktimeA = BN.max(locktimeA, sLocktime)
            }

            if (typeB === PlatformVMConstants.STAKEABLELOCKOUTID) {
                let sLocktime = (b.getOutput() as StakeableLockOut).getStakeableLocktime()
                locktimeB = BN.max(locktimeB, sLocktime)
            }

            let now = UnixNow()

            // if (now.lt(locktimeA) && now.lt(locktimeB)) {
            if (locktimeA.gt(locktimeB)) {
                return -1
            } else if (locktimeA.lt(locktimeB)) {
                return 1
            }
            // }

            // Sort by amount
            let outA = a.getOutput() as StakeableLockOut | SECPTransferOutput
            let outB = b.getOutput() as StakeableLockOut | SECPTransferOutput

            let amtA = outA.getAmount()
            let amtB = outB.getAmount()

            if (amtA.gt(amtB)) {
                return -1
            } else {
                return 1
            }

            return 0
        })
    }

    get selectedBalance() {
        let res = this.utxos.reduce((acc, utxo) => {
            let out = utxo.getOutput() as AmountOutput | StakeableLockOut
            return acc.add(out.getAmount())
        }, new BN(0))
        return res
    }

    get selectedBalanceText() {
        return bnToBig(this.selectedBalance, 9).toLocaleString()
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
.utxo_select_modal_body {
    width: 720px;
    max-width: 100%;
    padding: 10px 20px;
}

table {
    width: 100%;
}

.table_cont {
    height: 230px;
    max-height: 100%;
    overflow: scroll;
    position: relative;
    background-color: var(--bg-light);
}

table {
    border-collapse: collapse;
}
th {
    background-color: var(--bg);
    z-index: 1;
    padding: 2px 0;
    border-bottom: 1px solid var(--bg);
    position: sticky;
    top: 0;
    font-size: 13px;
}

.col_amt {
    text-align: right;
    padding-right: 18px;
}

.tot {
    display: flex;
    //background-color: var(--bg-light);
    padding: 8px 12px;
    margin: 14px 0;
    justify-content: space-between;
}
</style>
