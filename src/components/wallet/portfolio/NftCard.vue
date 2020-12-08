<template>
    <div class="nft_card">
        <component
            :is="nftClass"
            :payload="payloadBase"
            :mini="mini"
            :rawCard="rawCard"
            :utxo="utxo"
        ></component>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Buffer } from 'buffer/'

import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import { PayloadTypes, PayloadBase } from 'avalanche/dist/utils'
import * as jdenticon from 'jdenticon'

const payloadtypes = PayloadTypes.getInstance()

import UTF8_NFT from '@/components/NftCards/UTF8_NFT.vue'
import URL_NFT from '@/components/NftCards/URL_NFT.vue'
@Component
export default class NftCard extends Vue {
    @Prop() utxo!: UTXO
    @Prop({ default: false }) mini?: boolean
    @Prop({ default: false }) rawCard?: boolean

    get payload() {
        let output = this.utxo.getOutput() as NFTTransferOutput
        let payload = output.getPayloadBuffer()
        return payload
    }

    get payloadBase() {
        let payload = this.payload

        let typeId = payloadtypes.getTypeID(payload)
        let pl: Buffer = payloadtypes.getContent(payload)
        let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

        return payloadbase
    }

    generateIdenticon() {
        let canv = this.$refs['canvas'] as HTMLCanvasElement
        let cont = canv.getContext('2d')
        let text = this.payloadBase.toBuffer().toString('utf-8')
        jdenticon.drawIcon(cont!, text, canv.width)
    }

    get nftClass() {
        let res
        switch (this.payloadBase.typeID()) {
            case 1: // UTF 8
                res = UTF8_NFT
                break
            case 27: // url
                res = URL_NFT
                break
            default:
                res = UTF8_NFT
        }
        return res
    }
}
</script>
<style scoped lang="scss">
.nft_card {
    word-break: break-all;
    max-width: 100%;
    //width: 130px;
    //max-height: 420px;
    max-height: 100%;
    /*overflow: hidden;*/
}

.nft_info {
    padding: 30px;
}

.nft_raw {
    word-break: break-all;
    max-height: 90px;
    overflow: scroll;
    text-align: center;
    padding: 4px;
}

canvas {
    width: 100%;
    height: 180px;
}
</style>
