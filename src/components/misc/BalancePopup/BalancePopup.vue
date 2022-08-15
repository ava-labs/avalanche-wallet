<!-- NO LONGER IN USE-->

<template>
    <div class="balance_popup" v-show="isActive">
        <div class="bg" @click="closePopup"></div>
        <div class="popup_body">
            <p class="desc">
                Select an asset
                <button class="close" @click="closePopup" style="float: right">
                    <fa icon="times"></fa>
                </button>
            </p>
            <div class="rows" v-if="!isNft">
                <BalanceRow
                    class="bal_row"
                    v-for="asset in assets"
                    :key="asset.id"
                    :zero="asset.amount.isZero()"
                    @click.native="select(asset)"
                    :disabled="isDisabled(asset)"
                    :asset="asset"
                ></BalanceRow>
            </div>
            <CollectibleTab
                class="nfts"
                @select="selectNFT"
                :disabled-ids="disabledIds"
                v-else
            ></CollectibleTab>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import AvaAsset from '@/js/AvaAsset'
import BalanceRow from './BalanceRow.vue'
import CollectibleTab from './CollectibleTab.vue'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'

@Component({
    components: {
        BalanceRow,
        CollectibleTab,
    },
})
export default class BalancePopup extends Vue {
    @Prop() assets!: AvaAsset[]
    @Prop({ default: false }) isNft?: boolean
    @Prop({ default: () => [] }) disabledIds!: string[] // asset id | if nft the utxo id

    isActive: boolean = false

    select(asset: AvaAsset) {
        if (asset.amount.isZero()) return
        if (this.isDisabled(asset)) return

        this.$emit('select', asset)
    }

    selectNFT(utxo: UTXO) {
        this.$emit('select', utxo)
        this.closePopup()
    }

    isDisabled(asset: AvaAsset): boolean {
        if (this.disabledIds.includes(asset.id)) return true
        return false
    }

    closePopup() {
        this.isActive = false
        this.$emit('close')
    }
}
</script>
<style lang="scss">
.popup_body {
    width: max-content;
    .v-tabs {
        overflow: auto;
    }

    .v-tabs-bar {
        background-color: var(--bg-light) !important;
    }

    .v-item-group {
        overflow: scroll;
        height: calc(100% - 34px);
    }

    .v-window .v-tabs-items {
        overflow: scroll;
        height: calc(100% - 34px);
    }
}
</style>
<style scoped lang="scss">
@use '../../../styles/main';
.bg {
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.desc {
    font-size: 0.8rem;
    padding: 3px 15px;
    background-color: var(--primary-color);
    color: var(--bg);
}

.balance_popup {
    position: absolute;
    top: 0;
    left: 100%;
    z-index: 99;
    text-align: left;
}

.popup_body {
    position: relative;
    box-shadow: 2px 0px 6px rgba(0, 0, 0, 0.2);
    max-height: 340px;
    height: 340px;
    min-width: 280px;
    display: grid;
    grid-template-rows: max-content 1fr;
    overflow: auto;
    z-index: 3;
    background-color: var(--bg-light);
}

.rows,
.nfts {
    overflow: scroll;
}

.bal_row {
    padding: 6px 14px;
    width: 100%;
    overflow: auto;
    border-bottom: 1px solid var(--bg-light);
    display: grid;
    column-gap: 15px;
    grid-template-columns: 48px 1fr max-content;
    font-size: 0.8rem;
    transition-duration: 0.2s;
    cursor: pointer;
    user-select: none;

    &:hover {
        /*background-color: var(--primary-color);*/
        opacity: 0.4;
    }
}

.bal_row[zero] {
    cursor: default;
    opacity: 0.4;
    &:hover {
        background-color: inherit;
    }
}

.bal_row[disabled] {
    text-decoration: line-through;
}

.close {
    opacity: 0.3;

    &:hover {
        opacity: 1;
    }
}

@include main.mobile-device {
    .bg {
        background-color: rgba(0, 0, 0, 0.4);
    }
    .popup_body {
        box-shadow: 0px 0px 14px rgba(0, 0, 0, 0.4);
        max-height: none;
        border: none;
        position: fixed;
        width: 100%;
        height: 66vh !important;
        bottom: 0;
        left: 0;
    }

    .desc {
        font-size: 1.2rem;
    }

    .bal_row {
        padding: 12px 14px;
        font-size: 0.9rem;
    }
}
</style>
