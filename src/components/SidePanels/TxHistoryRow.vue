<template>
    <div class="tx_history_row">
        <div>
            <p class="time">
                {{ timeText }}
                <a
                    v-if="explorerUrl"
                    :href="explorerUrl"
                    target="_blank"
                    tooltip="View in Explorer"
                    class="explorer_link"
                >
                    <fa icon="search"></fa>
                </a>
            </p>
            <div v-if="memo" class="memo">
                <p>Memo</p>
                <p>{{ memo }}</p>
            </div>
        </div>
        <component :is="viewComponent" :transaction="transaction"></component>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import moment from 'moment'
// import TxHistoryValue from '@/components/SidePanels/TxHistoryValue.vue'
import TxHistoryNftFamilyGroup from '@/components/SidePanels/TxHistoryNftFamilyGroup.vue'
import { Chain, ITransactionData } from '@/store/modules/history/types'
import { AvaNetwork } from '@/js/AvaNetwork'
import ImportExport from '@/components/SidePanels/History/ViewTypes/ImportExport.vue'
import BaseTx from '@/components/SidePanels/History/ViewTypes/BaseTx.vue'
import StakingTx from '@/components/SidePanels/History/ViewTypes/StakingTx.vue'
import getMemoFromByteString from '@/services/history/utils'

@Component({
    components: {
        // TxHistoryValue,
        TxHistoryNftFamilyGroup,
        // TxHistoryValueFunctional,
    },
})
export default class TxHistoryRow extends Vue {
    @Prop() transaction!: ITransactionData

    get explorerUrl(): string | null {
        let network: AvaNetwork = this.$store.state.Network.selectedNetwork
        if (network.explorerSiteUrl) {
            let chains = this.$store.state.History.chains
            let alias = chains.find((elem: Chain) => elem.chainID === this.transaction.chainID)
                .chainAlias
            let url = `${network.explorerSiteUrl}/${alias}-chain/transactions/${this.transaction.id}`
            return url
        }
        return null
    }

    get memo(): string | null {
        const memo = this.transaction.memo
        return getMemoFromByteString(memo)
    }

    get time() {
        return moment(this.transaction.timestamp)
    }

    get timeText(): string {
        let now = Date.now()
        let diff = now - new Date(this.transaction.timestamp).getTime()

        let dayMs = 1000 * 60 * 60 * 24

        if (diff > dayMs) {
            return this.time.format('MMM DD, YYYY')
        }
        return this.time.fromNow()
    }

    get viewComponent() {
        let type = this.transaction.type

        switch (type) {
            case 'export':
            case 'import':
            case 'pvm_export':
            case 'pvm_import':
                return ImportExport
            case 'add_delegator':
            case 'add_validator':
                return StakingTx
            default:
                return BaseTx
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.icons {
    justify-self: center;
    img {
        width: 20px;
        height: 20px;
        object-fit: contain;
    }
}

.tx_history_row {
    padding: 10px 0px;
    /*padding-right: 0;*/
    /*display: grid;*/
    /*grid-template-columns: 40px 1fr;*/

    > div {
        align-self: center;
        overflow: auto;
    }
}

.explorer_link {
    color: var(--primary-color-light);
}

.time {
    font-size: 15px;

    a {
        float: right;
        opacity: 0.4;
        font-size: 12px;

        &:hover {
            opacity: 0.8;
        }
    }
}

.from {
    font-size: 12px;
    color: var(--primary-color-light);
    word-break: keep-all;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.rewarded,
.memo {
    overflow-wrap: break-word;
    word-break: break-word;
    font-size: 12px;
    color: main.$primary-color-light;
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 12px;
    margin-bottom: 4px;

    p:last-of-type {
        text-align: right;
    }
}

.rewarded {
    span {
        margin-right: 6px;
        color: var(--success);
    }
}
.not_rewarded span {
    color: var(--error);
}
.nfts {
    display: flex;
    flex-wrap: wrap;
    margin-top: 5px;
    justify-content: flex-end;
    > div {
        margin-left: 5px;
    }
}

@include main.medium-device {
    .icons {
        justify-self: left;
        img {
            width: 14px;
            height: 14px;
            object-fit: contain;
        }
    }

    .tx_history_row {
        padding: 8px 0px;
        grid-template-columns: 24px 1fr;
    }
    .time {
        font-size: 14px;
        text-align: left;
    }
}
</style>
