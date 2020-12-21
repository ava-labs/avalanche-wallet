<template>
    <div class="family">
        <div class="previews">
            <NftPayloadView
                v-for="(payload, i) in groupPayloads"
                :key="i"
                :payload="payload"
                class="group_preview"
                :small="true"
                :style="{
                    zIndex: groupPayloads.length - i,
                    transform: `translateX(0%)  rotateZ(${
                        (i - groupPayloads.length / 2) * rotateDeg
                    }deg)`,
                }"
            ></NftPayloadView>
            <div v-if="groupPayloads.length === 0" class="group_preview empty_card">
                <p><fa icon="plus"></fa></p>
            </div>
            <!--            <p v-if="groupPayloads.length === 0" class="empty">-->
            <!--                You do not own any collectibles from this family.-->
            <!--            </p>-->
        </div>
        <div
            class="family_header"
            @click="select"
            @mouseenter="mouseEnter"
            @mouseleave="mouseLeave"
        >
            <p class="name">{{ family.name }}</p>
            <p class="symbol">{{ family.symbol }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AvaNftFamily } from '../../../../../js/AvaNftFamily'
import { IWalletNftMintDict } from '@/store/types'
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import { getPayloadFromUTXO } from '@/helpers/helper'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
@Component({
    components: { NftPayloadView },
})
export default class FamilyRow extends Vue {
    @Prop() family!: AvaNftFamily

    rotateDeg = 5
    maxReviewItems = 14

    mouseEnter() {
        let len = this.groupPayloads.length
        let maxLen = this.maxReviewItems
        this.rotateDeg = 25 * ((maxLen - len) / maxLen) + 5
    }
    mouseLeave() {
        this.rotateDeg = 5
    }
    get mintUtxos() {
        return this.nftMintDict[this.family.id]
    }

    get utxosCapped() {
        return this.mintUtxos.slice(0, 10)
    }

    get nftMintDict(): IWalletNftMintDict {
        return this.$store.getters.walletNftMintDict
    }

    get nftUtxoDict(): IWalletNftMintDict {
        return this.$store.getters.walletNftDict
    }

    // return utxos belonging to this family
    get nftUtxos(): UTXO[] {
        return this.nftUtxoDict[this.family.id] || []
    }

    // Return 1 of each group
    get groupUtxos() {
        let utxos = this.nftUtxos
        let ids: number[] = []

        let filtered = utxos.filter((utxo) => {
            let groupId = (utxo.getOutput() as NFTTransferOutput).getGroupID()

            if (ids.includes(groupId)) {
                return false
            } else {
                ids.push(groupId)
                return true
            }
        })

        // order by group id
        filtered.sort((a, b) => {
            let gA = (a.getOutput() as NFTTransferOutput).getGroupID()
            let gB = (b.getOutput() as NFTTransferOutput).getGroupID()
            return gA - gB
        })

        return filtered.slice(0, this.maxReviewItems)
    }

    get groupPayloads() {
        return this.groupUtxos.map((utxo) => {
            return getPayloadFromUTXO(utxo)
        })
    }

    get isCapped() {
        return this.mintUtxos.length !== this.utxosCapped.length
    }

    select() {
        this.$emit('select', this.mintUtxos[0])
    }
}
</script>
<style scoped lang="scss">
@use '../../../../../main';

.family {
    margin-top: 24px;
    //border: 1px solid var(--bg-light);
    //background-color: var(--bg-light);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 6px 12px;
    //background-color: var(--bg-light);
}

.previews {
    display: flex;
    flex-grow: 1;
    position: relative;
    min-height: 70px;
    z-index: 1;
    //display: grid;
    //grid-template-columns: repeat(5, 1fr);
}
.group_preview {
    width: 70px !important;
    height: 90px !important;
    flex-shrink: 0;
    background-color: var(--bg-light);
    border: 1px solid var(--bg-light);
    border-radius: 4px;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    user-select: none;
    transform-origin: bottom center;
    transition-duration: 0.2s;
    position: absolute;
    left: calc(50% - 35px);
}

.family_header {
    display: flex;
    flex-direction: column;
    margin: 14px 0px;
    align-items: center;
    font-size: 16px;
    transition-duration: 0.2s;
    padding: 6px 0;
    cursor: pointer;
    z-index: 2;
    background-color: var(--bg-light);
    border-radius: 4px;
    //border: 1px solid var(--primary-color-light);
    user-select: none;
    box-shadow: 1px 0px 3px rgba(0, 0, 0, 0.4);

    .symbol,
    .id {
        opacity: 0.6;
    }

    .symbol {
        font-size: 13px;
    }

    .id {
        flex-grow: 1;
        font-size: 13px;
        text-align: right;
        opacity: 0.4;
        word-break: break-all;
    }

    &:hover {
        background-color: var(--secondary-color);
        color: #fff !important;
        border-color: transparent;
    }
}

.empty {
    font-size: 12px;
    text-align: center;
    flex-grow: 1;
    align-self: center;
}

.empty_card {
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color-light);
    border: 2px dashed var(--primary-color-light);
}
</style>
