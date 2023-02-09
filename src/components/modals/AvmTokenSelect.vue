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
                    class="token_row"
                >
                    <img
                        v-if="asset.symbol === 'CAM'"
                        src="/img/native_token.png"
                        class="col_img"
                    />
                    <p v-else class="col_img">?</p>
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
}

$logo_w: 38px;

.token_row {
    padding: 10px 20px;
}

.token_row {
    font-size: 15px;
    display: grid;
    grid-template-columns: max-content max-content 1fr;
    column-gap: 12px;
    cursor: pointer;
    user-select: none;

    > * {
        align-self: center;
    }

    img {
        object-fit: contain;
    }

    &:hover {
        background-color: var(--bg-light);

        .col_img {
            background-color: var(--primary-color);
            color: var(--bg-wallet);
        }
    }
}

.col_img {
    width: $logo_w;
    height: $logo_w;
    border-radius: $logo_w;
    background-color: var(--bg-light);
    text-align: center;
    line-height: $logo_w;
}

.col_name {
    text-align: left;

    p:last-of-type {
        color: var(--primary-color-light);
        font-size: 13px;
    }
}

.col_balance {
    text-align: right;
}

@include main.mobile-device {
    .avm_token_select {
        width: 100%;
    }
}
</style>
