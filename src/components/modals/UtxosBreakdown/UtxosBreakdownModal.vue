<template>
    <Modal title="Wallet UTXO Breakdown" ref="modal">
        <div class="utxos_breakdown_body">
            <div class="tabs">
                <button @click="setChain('X')" :active="chain === 'X'">X Chain</button>
                <button @click="setChain('P')" :active="chain === 'P'">P Chain</button>
            </div>
            <div class="scrollable">
                <div style="height: 90px">
                    <table cellspacing="0" cellpadding="0">
                        <thead>
                            <tr>
                                <th></th>
                                <th class="col_id">ID</th>
                                <th>Type</th>
                                <th>Locktime</th>
                                <th class="col_thresh">Threshold</th>
                                <th>Owners</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <UTXORow
                                v-for="utxo in avmUTXOs"
                                :key="utxo.getUTXOID()"
                                :utxo="utxo"
                                v-show="chain === 'X'"
                            ></UTXORow>
                            <UTXORow
                                v-for="utxo in platformUTXOs"
                                :key="utxo.getUTXOID()"
                                :utxo="utxo"
                                v-show="chain === 'P'"
                                :is-x="false"
                            ></UTXORow>
                            <tr v-if="isEmpty" class="empty_row">
                                <td colspan="7">
                                    <p style="text-align: center">
                                        You do not have any UTXOs on this chain.
                                    </p>
                                </td>
                            </tr>
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
import { WalletType } from '@/js/wallets/types'

import { UTXO as AVMUTXO, AVMConstants } from '@c4tplatform/camino/dist/apis/avm'
import {
    UTXO as PlatformUTXO,
    PlatformVMConstants,
    StakeableLockOut,
} from '@c4tplatform/camino/dist/apis/platformvm'
import UTXORow from '@/components/modals/UtxosBreakdown/AVMUTXORow.vue'

@Component({
    components: { UTXORow, Modal },
})
export default class UtxosBreakdownModal extends Vue {
    chain = 'X'

    $refs!: {
        modal: Modal
    }
    open(): void {
        let modal = this.$refs.modal as Modal
        //@ts-ignore
        modal.open()
    }

    setChain(chainID: string) {
        this.chain = chainID
    }

    get wallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get avmUTXOs(): AVMUTXO[] {
        if (!this.wallet) return []
        let utxos = this.wallet.getUTXOSet().getAllUTXOs()
        let sorted = utxos.sort(this.sortFnc)
        return sorted
    }

    get platformUTXOs(): PlatformUTXO[] {
        if (!this.wallet) return []
        let utxos = this.wallet.getPlatformUTXOSet().getAllUTXOs()
        let sorted = utxos.sort(this.sortFnc)
        return sorted
    }

    get isEmpty() {
        if (this.chain === 'X') {
            return this.avmUTXOs.length === 0
        } else {
            return this.platformUTXOs.length === 0
        }
    }

    sortFnc<UTXO extends AVMUTXO | PlatformUTXO>(a: UTXO, b: UTXO) {
        let aOut = a.getOutput()
        let bOut = b.getOutput()

        let aType = aOut.getTypeID()
        let bType = bOut.getTypeID()

        if (aType === bType) {
            let aLock = aOut.getLocktime().toNumber()
            let bLock = bOut.getLocktime().toNumber()

            if (aType === PlatformVMConstants.STAKEABLELOCKOUTID) {
                let aStakeLock = (aOut as StakeableLockOut).getStakeableLocktime().toNumber()
                let bStakeLock = (bOut as StakeableLockOut).getStakeableLocktime().toNumber()

                aLock = Math.max(aLock, aStakeLock)
                bLock = Math.max(bLock, bStakeLock)
            }

            if (aLock !== bLock) return bLock - aLock
            return 0
        } else {
            if (aType === AVMConstants.SECPXFEROUTPUTID) {
                return -1
            } else if (bType === AVMConstants.SECPXFEROUTPUTID) {
                return 1
            }

            if (aType === AVMConstants.NFTXFEROUTPUTID) {
                return -1
            } else if (bType === AVMConstants.NFTXFEROUTPUTID) {
                return 1
            }

            if (aType === AVMConstants.NFTMINTOUTPUTID) {
                return -1
            } else if (bType === AVMConstants.NFTMINTOUTPUTID) {
                return 1
            }

            if (aType === AVMConstants.SECPMINTOUTPUTID) {
                return -1
            } else if (bType === AVMConstants.SECPMINTOUTPUTID) {
                return 1
            }

            // if(aType === AVMConstants.)
        }

        return 0
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
    position: relative;
}
table {
    width: 100%;
    overflow: scroll;
    border-collapse: collapse;
    padding: 0;
}
th {
    font-size: 13px;
    font-weight: bold;
    position: sticky;
    top: 0;
    background-color: var(--bg);
}

thead {
    tr {
        border-bottom: 2px solid var(--bg-wallet);
    }
}

.tabs {
    > button {
        padding: 12px 24px;
        transition-duration: 0.2s;

        &:hover {
            color: var(--secondary-color);
        }

        &[active] {
            background-color: var(--secondary-color);
            color: #fff;
        }
    }
}

.empty_row {
    color: var(--primary-color-light);
    td {
        padding: 30px;
    }
}
</style>

<style lang="scss">
.utxos_breakdown_body {
    .col_id {
        //padding-left: 12px !important;
        //width: 60px;
        display: block;
    }

    .col_thresh {
        text-align: center;
    }

    th,
    td {
        padding: 1px 4px;
    }
}
</style>
