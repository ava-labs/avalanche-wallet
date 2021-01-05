<template>
    <modal ref="modal" title="Check Your Ledger Device" :can_close="false">
        <div class="ledger_block" v-if="isActive">
            <p style="margin-bottom: 14px !important; font-size: 18px">
                Please confirm this action on your ledger device.
            </p>
            <p class="message">{{ title }}</p>
            <p class="message" v-if="!messages">{{ info }}</p>
            <p class="message" v-else v-for="message in messages" :key="message">
                {{ message }}
            </p>
            <Spinner class="spinner"></Spinner>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'

import Spinner from '@/components/misc/Spinner.vue'
import Modal from './Modal.vue'

@Component({
    components: {
        Modal,
        Spinner,
    },
})
export default class LedgerBlock extends Vue {
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

    get messages(): string {
        return this.$store.state.Ledger.messages
    }

    get isActive(): boolean {
        return this.$store.state.Ledger.isBlock
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

    // mounted(){
    //     setTimeout(()=>{
    //         this.open()
    //     },3000)
    // }
}
</script>
<style scoped lang="scss">
.ledger_block {
    pointer-events: none;
    padding: 30px;
    text-align: center;
}

.message {
    padding: 12px;
    color: var(--primary-color);
    background-color: var(--bg-wallet);
    margin: 4px 0 !important;
}

.spinner {
    width: 40px;
    font-size: 20px !important;
    margin: 20px auto !important;
    color: var(--primary-color) !important;
}
</style>
