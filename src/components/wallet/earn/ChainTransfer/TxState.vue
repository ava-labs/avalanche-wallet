<template>
    <div class="tx_state_card" :state="state">
        <div class="loading_header">
            <h4 v-if="isExport">{{ $t('cross_chain.state.export') }}</h4>
            <h4 v-else>{{ $t('cross_chain.state.import') }}</h4>
            <div class="status_icon">
                <Spinner v-if="state == 1" class="spinner"></Spinner>
                <p v-else-if="state === 2">
                    <fa icon="check-circle"></fa>
                </p>
                <p v-else-if="state === -1">
                    <fa icon="times-circle"></fa>
                </p>
            </div>
        </div>
        <div>
            <div class="data_row">
                <label>ID</label>
                <p>{{ txId || '-' }}</p>
            </div>
            <div class="data_row">
                <label>{{ $t('cross_chain.state.status') }}</label>
                <p v-if="!status">{{ $t('cross_chain.state.not_started') }}</p>
                <p v-else>{{ status }}</p>
            </div>
            <div v-if="reason" class="data_row">
                <label>{{ $t('cross_chain.state.reason') }}</label>
                <p>{{ reason }}</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Spinner from '@/components/misc/Spinner.vue'
import { TxState } from '@/components/wallet/earn/ChainTransfer/types'

@Component({
    components: {
        Spinner,
    },
})
export default class TxStateCard extends Vue {
    @Prop() state!: TxState
    @Prop() status!: string
    @Prop() reason!: string
    @Prop() txId!: string
    @Prop({ default: true }) isExport?: boolean
}
</script>
<style scoped lang="scss">
.loading_header {
    display: flex;
    justify-content: space-between;
}

.tx_state_card {
    position: relative;
    background-color: var(--bg-light);
    //height: max-content;

    &[state='0'] {
        opacity: 0.2;
    }

    &[state='2'] {
        .status_icon {
            color: var(--success);
        }
    }

    &[state='-1'] {
        .status_icon {
            color: var(--error);
        }
    }

    p {
        word-break: break-all;
        font-size: 13px;
    }
}

.tx_state_card {
    .spinner {
        color: var(--primary-color) !important;
    }
}

.data_row {
    margin: 4px 0;

    label {
        font-size: 12px;
        color: var(--primary-color-light);
    }
}
</style>
