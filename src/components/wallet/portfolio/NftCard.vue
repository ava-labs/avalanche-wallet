<template>
    <div class="nft_card">
        <p class="count" v-if="quantity > 1">{{ quantity }}</p>
        <NFTViewModal ref="modal" :payload="payload"></NFTViewModal>
        <NftPayloadView :payload="payload" class="view"></NftPayloadView>
        <div class="nft_info">
            <div class="meta_bar">
                <div>
                    <p>
                        <b>{{ $t('portfolio.collectibles.group') }}:</b>
                        {{ groupID }}
                    </p>
                    <p style="margin-left: 6px !important">{{ payloadTypeName }}</p>
                </div>

                <div>
                    <Tooltip
                        :text="$t('portfolio.collectibles.send')"
                        @click.native="transfer"
                        v-if="utxo"
                        class="nft_button"
                    >
                        <fa icon="share"></fa>
                    </Tooltip>
                    <Tooltip
                        :text="$t('portfolio.collectibles.expand')"
                        @click.native="expand"
                        class="nft_button"
                    >
                        <fa icon="expand"></fa>
                    </Tooltip>
                </div>
            </div>
            <div class="generic_nft_meta" v-if="nftTitle || nftDesc">
                <p class="nft_title" v-if="nftTitle">
                    {{ nftTitle }}
                </p>
                <p class="nft_desc" v-if="nftDesc">
                    {{ nftDesc }}
                </p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { PayloadTypes, PayloadBase } from '@c4tplatform/camino/dist/utils'

const payloadtypes = PayloadTypes.getInstance()

import Tooltip from '@/components/misc/Tooltip.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import NFTViewModal from '@/components/modals/NFTViewModal.vue'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
@Component({
    components: { NFTViewModal, NftPayloadView, Tooltip },
})
export default class NftCard extends Vue {
    @Prop() payload!: PayloadBase
    @Prop({ default: 1 }) quantity!: number
    @Prop() groupID!: number
    @Prop() utxo?: UTXO

    $refs!: {
        modal: NFTViewModal
    }

    transfer(ev: MouseEvent) {
        ev.stopPropagation()
        if (!this.utxo) return

        let utxoId = this.utxo.getUTXOID()
        this.$router.push({
            path: '/wallet/transfer',
            query: {
                nft: utxoId,
                chain: 'X',
            },
        })
    }

    expand() {
        this.$refs.modal.open()
    }

    get payloadTypeID() {
        return this.payload.typeID()
    }

    get payloadTypeName() {
        return payloadtypes.lookupType(this.payloadTypeID) || 'Unknown Type'
    }

    get payloadContent() {
        return this.payload.getContent().toString()
    }

    get nftTitle() {
        try {
            let json = JSON.parse(this.payloadContent)
            return json.avalanche.title
        } catch (err) {
            return ''
        }
    }

    get nftDesc() {
        try {
            let json = JSON.parse(this.payloadContent)
            return json.avalanche.desc
        } catch (err) {
            return ''
        }
    }
}
</script>
<style scoped lang="scss">
@use 'nft_card';
</style>
