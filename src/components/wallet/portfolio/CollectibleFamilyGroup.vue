<template>
    <div class="family_group" @mouseleave="mouseLeave">
        <NFTViewModal ref="modal" :payload="payload"></NFTViewModal>
        <p class="count" v-if="quantity > 1">{{ quantity }}</p>
        <div class="nft_card">
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
                        <Tooltip text="Send" @click.native="transfer" class="nft_button">
                            <fa icon="share"></fa>
                        </Tooltip>
                        <Tooltip text="Expand" @click.native="expand" class="nft_button">
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
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from 'avalanche/dist/utils'
import { Buffer } from 'avalanche'
import { PayloadTypes } from 'avalanche/dist/utils'
import Tooltip from '@/components/misc/Tooltip.vue'
import NFTViewModal from '@/components/modals/NFTViewModal.vue'

let payloadtypes = PayloadTypes.getInstance()
@Component({
    components: { NFTViewModal, Tooltip, NftPayloadView },
})
export default class CollectibleFamilyGroup extends Vue {
    @Prop() utxos!: UTXO[]

    $refs!: {
        modal: NFTViewModal
    }

    isFlip = false

    mouseLeave() {
        if (this.isFlip) {
            this.flip()
        }
    }
    get quantity() {
        return this.utxos.length
    }

    get groupID() {
        let output = this.utxos[0].getOutput() as NFTTransferOutput
        return output.getGroupID()
    }

    get payload(): PayloadBase {
        let out = this.utxos[0].getOutput() as NFTTransferOutput
        let payload = out.getPayloadBuffer()

        let typeId = payloadtypes.getTypeID(payload)
        let pl: Buffer = payloadtypes.getContent(payload)
        let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

        return payloadbase
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

    flip() {
        this.isFlip = !this.isFlip
    }

    transfer(ev: MouseEvent) {
        ev.stopPropagation()

        let utxoId = this.utxos[0].getUTXOID()
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
}
</script>
<style scoped lang="scss">
@use '../../../main';

$countW: 28px;
.count {
    position: absolute;
    top: -$countW/3;
    right: -$countW/3;
    width: $countW;
    height: $countW;
    border-radius: $countW;
    line-height: $countW;
    font-size: 12px;
    text-align: center;
    background-color: var(--primary-color);
    //border: 1px solid var(--bg-wallet);
    color: var(--bg);
    font-weight: bold;
    z-index: 2;
}
.family_group {
    position: relative;
}

.nft_card {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    border: 2px solid var(--bg-light);
}

.back {
    backface-visibility: hidden;
    transform: rotateY(180deg);
    background-color: var(--bg-light);
}

.front {
    max-height: 100%;
    height: 100%;
    z-index: 1;
}

.view {
    width: 100%;
    //height: 100%;
    height: 300px;
}

.front,
.back {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    //border-radius: 14px;
    overflow: auto;
    //box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
}

.back {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.generic_nft_meta {
    //border-top: 2px solid var(--bg-light);
    padding-top: 0 !important;

    .nft_title {
        font-weight: bold;
    }
}
.nft_info {
    border-top: 2px solid var(--bg-light);
    font-size: 12px;

    > * {
        padding: 8px 12px;
    }

    .meta_bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .nft_button {
            opacity: 0.5;

            &:hover {
                opacity: 1;
            }
        }

        > div {
            display: flex;
            flex-direction: row;
        }

        p,
        button {
            opacity: 0.5;
        }

        button,
        .nft_button {
            margin: 0px 4px;
        }

        button:hover {
            opacity: 1;
        }
    }
}

@include main.mobile-device {
}
</style>
