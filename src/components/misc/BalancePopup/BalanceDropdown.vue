<template>
    <div class="dropdown hover_border" :active="isPopup">
        <button @click="showPopup" :disabled="disabled">
            {{ symbol }}
        </button>
        <AvmTokenSelect
            ref="token_modal"
            @select="onselect"
            :assets="assetArray"
            :disabled-ids="disabledIds"
        ></AvmTokenSelect>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Ref, Model } from 'vue-property-decorator'

import BalancePopup from '@/components/misc/BalancePopup/BalancePopup.vue'
import AvaAsset from '@/js/AvaAsset'
import AvmTokenSelect from '@/components/modals/AvmTokenSelect.vue'

@Component({
    components: {
        AvmTokenSelect,
        BalancePopup,
    },
})
export default class BalanceDropdown extends Vue {
    isPopup: boolean = false

    @Prop({ default: () => [] }) disabled_assets!: AvaAsset[]
    @Prop({ default: false }) disabled!: boolean
    @Model('change', { type: AvaAsset }) readonly asset!: AvaAsset

    get assetArray(): AvaAsset[] {
        // return this.$store.getters.walletAssetsArray
        return this.$store.getters['Assets/walletAssetsArray']
    }

    $refs!: {
        popup: BalancePopup
        token_modal: AvmTokenSelect
    }

    get disabledIds(): string[] {
        let disabledIds = this.disabled_assets.map((a) => a.id)
        return disabledIds
    }

    get symbol() {
        let sym = this.asset.symbol
        return sym
    }

    // get isPopup(){
    //     if(this.balancePopup){
    //         return this.balancePopup.isActive;
    //     }
    //     return false;
    // }

    showPopup() {
        this.$refs.token_modal.open()
        // this.balancePopup.isActive = true
        // this.isPopup = true
    }

    onclose() {
        // this.isPopup = false
    }

    onselect(asset: AvaAsset) {
        // this.selected = asset;
        // this.balancePopup.isActive = false
        // this.isPopup = false

        this.$emit('change', asset)
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

button {
    padding: 4px 12px;
    width: 100%;
    height: 100%;
    text-align: left;
    font-size: 15px;

    svg {
        transition-duration: 0.2s;
    }
}

.dropdown {
    position: relative;
    &:focus-within {
        outline: 1px solid var(--secondary-color);
    }
    > button {
        text-align: center;
    }
}

.dropdown[active] {
    button {
        svg {
            transform: rotateZ(180deg);
        }
    }
}
.popup {
    position: absolute;
}

@include main.mobile-device {
    button {
        font-size: 13px;
    }
}
</style>
