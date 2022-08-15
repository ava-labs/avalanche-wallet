<template>
    <modal ref="modal" title="Select Token" class="modal_main">
        <div class="avm_token_select">
            <div class="list">
                <div
                    v-for="asset in assets"
                    :key="asset.id"
                    :zero="asset.amount.isZero()"
                    :disabled="isDisabled(asset)"
                    @click="select(asset)"
                >
                    <div class="col_name">
                        <p>{{ asset.symbol }}</p>
                        <p>{{ asset.name }}</p>
                    </div>
                    <div class="col_balance">
                        <p>{{ asset | bal }}</p>
                    </div>
                </div>
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import AvaAsset from '@/js/AvaAsset'
import { bnToBig } from '@/helpers/helper'

@Component({
    components: {
        Modal,
    },
    filters: {
        bal(asset: AvaAsset) {
            return bnToBig(asset.amount, asset.denomination).toLocaleString()
        },
    },
})
export default class PrivateKey extends Vue {
    @Prop() assets!: AvaAsset[]
    @Prop({ default: () => [] }) disabledIds!: string[] // asset id | if nft the utxo id

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    close() {
        let modal = this.$refs.modal as Modal
        modal.close()
    }

    select(asset: AvaAsset) {
        if (asset.amount.isZero()) return
        if (this.isDisabled(asset)) return

        this.close()
        this.$emit('select', asset)
    }

    isDisabled(asset: AvaAsset): boolean {
        if (this.disabledIds.includes(asset.id)) return true
        return false
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.avm_token_select {
    width: 520px;
    max-width: 100%;
}

.list {
    display: flex;
    flex-direction: column;
    max-height: 60vh;

    > div {
        display: grid;
        grid-template-columns: max-content 1fr;
        padding: 10px 20px;
        cursor: pointer;
        user-select: none;

        &:hover {
            background-color: var(--bg-light);
        }

        &[disabled] {
            opacity: 0.3;
        }
    }
}

.col_name {
    text-align: left;

    p:last-of-type {
        color: var(--primary-color-light);
        font-size: 13px;
    }
}

.col_balance {
    align-self: center;
}

@include main.mobile-device {
    .avm_token_select {
        width: 100%;
    }
}
</style>
