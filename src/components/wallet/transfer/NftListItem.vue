<template>
    <div>
        <button @click="remove" class="removeBut" v-if="!disabled">
            <fa icon="times"></fa>
        </button>
        <div class="amt_in hover_border">
            <input
                type="number"
                min="1"
                inputmode="numeric"
                :max="allUtxos.length"
                v-model="quantity"
                :disabled="disabled"
            />
        </div>
        <NftPayloadView :payload="payload" small="true"></NftPayloadView>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NFTTransferOutput, UTXO } from '@c4tplatform/camino/dist/apis/avm'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { getPayloadFromUTXO } from '@/helpers/helper'
import { bintools } from '@/AVA'
import { IGroupQuantity } from '@/components/wallet/studio/mint/types'

@Component({
    components: {
        NftPayloadView,
    },
})
export default class NftListItem extends Vue {
    @Prop() sample!: UTXO
    @Prop({ default: false }) disabled!: boolean

    quantity = 1

    @Watch('quantity')
    onQuantitChange(val: number) {
        if (val < 1) {
            this.quantity = 1
            return
        }
    }

    @Watch('quantity')
    onQuantityChange(val: number) {
        let max = this.allUtxos.length

        if (val > max) {
            this.quantity = max
        }

        this.emit()
    }

    emit() {
        let msg: IGroupQuantity = {
            id: `${this.assetId}_${this.groupId}`,
            utxos: this.selectedUtxos,
        }
        this.$emit('change', msg)
    }

    get assetId() {
        let famId = this.sample.getAssetID()
        return bintools.cb58Encode(famId)
    }

    get selectedUtxos() {
        return this.allUtxos.slice(0, this.quantity)
    }

    get payload() {
        return getPayloadFromUTXO(this.sample)
    }

    get groupId() {
        return (this.sample.getOutput() as NFTTransferOutput).getGroupID()
    }

    get allUtxos() {
        let famId = this.sample.getAssetID()
        // let utxos: UTXO[] = this.$store.getters.walletNftDict[bintools.cb58Encode(famId)]
        let utxos: UTXO[] = this.$store.getters['Assets/walletNftDict'][bintools.cb58Encode(famId)]

        let filtered = utxos.filter((utxo) => {
            let gId = (utxo.getOutput() as NFTTransferOutput).getGroupID()

            if (gId === this.groupId) {
                return true
            }
            return false
        })
        return filtered
    }

    remove() {
        this.$emit('remove', this.sample)
    }

    mounted() {
        this.emit()
    }
}
</script>
<style scoped lang="scss">
$remove_w: 24px;
.removeBut {
    position: absolute;
    z-index: 1;
    top: -$remove_w/4;
    right: -$remove_w/4;
    width: $remove_w;
    height: $remove_w;
    background-color: var(--bg-light);
    color: var(--primary-color-light);
    border: 3px solid var(--bg);
    font-size: 12px;
    border-radius: $remove_w;

    &:hover {
        color: var(--primary-color);
    }
}

.amt_in {
    position: absolute;
    bottom: -12px;
    width: 60%;
    padding: 2px 6px;
    //border: 1px solid var(--bg);
    border-radius: var(--border-radius-sm);
    z-index: 2;
    align-items: center;
    //border-radius: var(--border-radius-sm);
    font-size: 12px;
    background-color: var(--primary-color);
    color: var(--bg) !important;
    display: flex;

    label {
        font-size: 11px;
        display: block;
        font-weight: bold;
        text-align: right;
        display: none;
    }

    p {
        color: var(--bg) !important;
        font-size: 12px;
    }

    > input {
        border: none !important;
        width: 100%;
        color: var(--bg) !important;
        text-align: center;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }
    }
}
</style>
