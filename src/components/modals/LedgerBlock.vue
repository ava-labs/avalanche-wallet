<template>
    <modal ref="modal" title="Accessing Ledger Device" :can_close="false">
        <div class="ledger_block" v-if="isActive">
            <p v-if="isPrompt" style="font-size: 18px">
                {{ $t('modal.ledger.desc') }}
            </p>
            <p class="alert" v-if="warning">{{ warning }}</p>

            <p class="message">{{ title }}</p>
            <p class="message" v-if="info">{{ info }}</p>
            <template v-else>
                <div class="message block" v-for="(message, i) in messages" :key="i">
                    <p class="title">{{ message.title }}</p>
                    <p class="value">{{ message.value }}</p>
                </div>
            </template>
            <Spinner class="spinner"></Spinner>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'

import Spinner from '@/components/misc/Spinner.vue'
import Modal from './Modal.vue'
import { ILedgerBlockMessage } from '../../store/modules/ledger/types'
import { LEDGER_EXCHANGE_TIMEOUT } from '../../store/modules/ledger/types'

@Component({
    components: {
        Modal,
        Spinner,
    },
})
export default class LedgerBlock extends Vue {
    intervalId: ReturnType<typeof setTimeout> | null = null

    open() {
        // @ts-ignore
        this.$refs.modal.open()
    }
    close() {
        // @ts-ignore
        this.$refs.modal.close()
    }

    get title(): string {
        return this.$store.state.Ledger.title
    }

    get info(): string {
        return this.$store.state.Ledger.info
    }

    get messages(): Array<ILedgerBlockMessage> {
        return this.$store.state.Ledger.messages
    }

    get isActive(): boolean {
        return this.$store.state.Ledger.isBlock
    }

    get isPrompt(): boolean {
        return this.$store.state.Ledger.isPrompt
    }

    get warning() {
        return this.$store.state.Ledger.warning
    }

    @Watch('isActive', { immediate: true })
    onActive(val: boolean): void {
        if (!this.$refs.modal) return
        if (val) {
            this.open()
        } else {
            this.close()
        }
    }
}
</script>
<style scoped lang="scss">
.ledger_block {
    pointer-events: none;
    padding: 30px;
    max-width: 600px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.message .title {
    line-height: 1rem;
    font-size: 0.8rem !important;
    color: var(--primary-color-light);
}

.alert {
    color: var(--error);
}

.message {
    padding: 12px;
    color: var(--primary-color);
    width: 100%;
    margin: 4px 0 !important;
    word-break: break-all;
    background-color: var(--bg-wallet);
}

.message.block {
    text-align: left;
    padding: 6px 12px;
}

.message.desc {
    padding: 6px;
    margin-top: 2px;
    margin-bottom: 8px;
    font-size: 1rem;
}

.spinner {
    width: 40px;
    font-size: 20px !important;
    margin: 20px auto !important;
    color: var(--primary-color) !important;
}
</style>
