<template>
    <div v-if="!isEmpty">
        <AvmNftSelectModal
            ref="select_modal"
            @select="addNft"
            :disabled-ids="usedNftIds"
        ></AvmNftSelectModal>
        <div class="added_list">
            <NftListItem
                v-for="utxo in addedNfts"
                class="nft_icon"
                @remove="remove"
                :key="utxo.getUTXOID()"
                :sample="utxo"
                :disabled="disabled"
                @change="setGroupUtxos"
            ></NftListItem>
            <div class="nft_icon card nft_add">
                <button @click="showPopup" class="add_but" v-if="!disabled">
                    <fa icon="plus"></fa>
                    <br />
                    Add Collectible
                </button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { IWalletNftDict } from '../../../store/types'
import { NftFamilyDict } from '../../../store/modules/assets/types'
import BalancePopup from '@/components/misc/BalancePopup/BalancePopup.vue'

import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NFTTransferOutput, UTXO } from '@c4tplatform/camino/dist/apis/avm'
import { getPayloadFromUTXO } from '@/helpers/helper'
import NftListItem from '@/components/wallet/transfer/NftListItem.vue'
import { IGroupDict, IGroupQuantity } from '@/components/wallet/studio/mint/types'
import { bintools } from '@/AVA'
import AvmNftSelectModal from '@/components/modals/AvmNftSelectModal.vue'

@Component({
    components: {
        AvmNftSelectModal,
        BalancePopup,
        NftListItem,
    },
})
export default class NftList extends Vue {
    addedNfts: UTXO[] = []

    groupUtxos: IGroupDict = {}

    $refs!: {
        popup: BalancePopup
        select_modal: AvmNftSelectModal
    }

    @Prop({ default: false }) disabled!: boolean

    // @Watch('addedNfts')
    // onlistchange(val: UTXO[]) {
    //     this.$emit('change', val)
    // }

    setGroupUtxos(val: IGroupQuantity) {
        this.groupUtxos[val.id] = val.utxos
        this.emit()
    }

    emit() {
        let utxos = []

        for (var id in this.groupUtxos) {
            let gUtxos = this.groupUtxos[id]
            utxos.push(...gUtxos)
        }

        this.$emit('change', utxos)
    }

    // @Watch('groupUtxos')
    // onGroupUtxosChange(val: IGroupDict) {
    //     console.log(this.groupUtxos)
    // }

    get payloads() {
        return this.addedNfts.map((utxo) => {
            return getPayloadFromUTXO(utxo)
        })
    }

    get isEmpty(): boolean {
        return this.nftUTXOs.length === 0
    }

    get nftUTXOs(): UTXO[] {
        return this.$store.state.Assets.nftUTXOs
    }

    get nftDict(): IWalletNftDict {
        // return this.$store.getters.walletNftDict
        return this.$store.getters['Assets/walletNftDict']
    }

    get nftFamsDict(): NftFamilyDict {
        return this.$store.state.Assets.nftFamsDict
    }

    get usedNftIds() {
        return this.addedNfts.map((utxo: UTXO) => {
            return utxo.getUTXOID()
        })
    }

    clear() {
        this.addedNfts = []
        this.groupUtxos = {}
        this.emit()
    }

    addNft(utxo: UTXO) {
        this.addedNfts.push(utxo)
    }

    remove(utxo: UTXO) {
        let famId = bintools.cb58Encode(utxo.getAssetID())
        let groupId = (utxo.getOutput() as NFTTransferOutput).getGroupID()

        // Clear from selected utxos list
        let dictId = `${famId}_${groupId}`
        delete this.groupUtxos[dictId]

        let utxos = this.addedNfts
        for (var i = 0; i < utxos.length; i++) {
            if (utxos[i].getUTXOID() === utxo.getUTXOID()) {
                this.addedNfts.splice(i, 1)
            }
        }

        this.emit()
    }

    showPopup() {
        this.$refs.select_modal.open()
        // this.$refs.popup.isActive = true
    }

    deactivated() {
        this.clear()
    }

    activated() {}
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

$nft_w: 90px;

.added_list {
    display: flex;
    flex-wrap: wrap;
}
.nft_icon {
    flex-shrink: 0;
    flex-grow: 0;
    position: relative;
    width: $nft_w;
    height: $nft_w;
    background-color: var(--bg-light);
    border-radius: 3px;
    margin: 4px;
    margin-bottom: 50px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:first-of-type {
        margin-left: 0;
    }
}

.nft_add {
    background-color: transparent;
    box-shadow: none !important;
}
.add_but {
    height: 100%;
    width: 100%;
    padding: 14px;
    border: 1px dashed var(--primary-color-light);
    cursor: pointer;
    font-size: 12px;
    opacity: 0.5;
    text-align: center;
    transition-duration: 0.2s;

    &:hover {
        opacity: 1;
    }
}

@include main.mobile-device {
    .added_list {
        display: grid;
        grid-gap: 12px;
        row-gap: 22px;
        grid-template-columns: repeat(4, 1fr);
    }

    .nft_icon {
        width: 100%;
        padding-top: 100%;
        position: relative;
        height: 0;
        margin: 0;
    }

    .add_but {
        position: absolute;
        top: 0;
    }
}
</style>
