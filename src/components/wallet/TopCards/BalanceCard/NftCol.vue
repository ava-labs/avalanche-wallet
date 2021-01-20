<template>
    <div class="nft_col">
        <h4>{{ $t('top.balance.collectibles') }}</h4>
        <p v-if="isEmpty">{{ $t('top.nftempty') }}</p>
        <div v-else>
            <p>{{ statusText }}</p>
            <div class="nft_list">
                <div class="nft_item" v-for="(utxo, i) in nftArray" :key="utxo.getUTXOID()">
                    <NftPayloadView :payload="nftPayloads[i]" small="true"></NftPayloadView>
                </div>
                <!--                <NftCard-->
                <!--                    v-for="nft in nftArray"-->
                <!--                    class="nft_item"-->
                <!--                    :key="nft.id"-->
                <!--                    :mini="true"-->
                <!--                    :utxo="nft"-->
                <!--                ></NftCard>-->
                <div v-for="i in dummyAmt" class="nft_item dummy_item" :key="i"></div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from 'vue-property-decorator'
import { IWalletNftDict } from '@/store/types'
// import {UTXO} from "avalanche";
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import NftCard from '@/components/wallet/portfolio/NftCard.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from 'avalanche/dist/utils'
import { Buffer } from 'avalanche'
import { PayloadTypes } from 'avalanche/dist/utils'
import { bintools } from '@/AVA'

let payloadtypes = PayloadTypes.getInstance()

@Component({
    components: {
        NftCard,
        NftPayloadView,
    },
})
export default class NftCol extends Vue {
    get isEmpty(): boolean {
        // return this.$store.getters.walletNftUTXOs.length === 0
        return this.$store.state.Assets.nftUTXOs.length === 0
    }

    get nftDict(): IWalletNftDict {
        // return this.$store.getters.walletNftDict
        return this.$store.getters['Assets/walletNftDict']
    }

    get nftArray(): UTXO[] {
        // let utxos: UTXO[] = this.$store.getters.walletNftUTXOs
        let utxos: UTXO[] = this.$store.state.Assets.nftUTXOs

        let ids: string[] = []
        // Filter same groups
        utxos = utxos.filter((utxo) => {
            let out = utxo.getOutput() as NFTTransferOutput
            let famId = bintools.cb58Encode(utxo.getAssetID())
            let groupId = out.getGroupID()

            let cacheId = `${famId}-${groupId}`
            if (ids.includes(cacheId)) {
                return false
            } else {
                ids.push(cacheId)
                return true
            }
        })

        return utxos.slice(0, 10)
    }

    get nftPayloads(): PayloadBase[] {
        return this.nftArray.map((utxo) => {
            let out = utxo.getOutput() as NFTTransferOutput
            let payload = out.getPayloadBuffer()

            let typeId = payloadtypes.getTypeID(payload)
            let pl: Buffer = payloadtypes.getContent(payload)
            let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

            return payloadbase
        })
    }

    get dummyAmt(): number {
        return 10 - this.nftArray.length
    }

    get collectedAmt(): number {
        // return this.$store.getters.walletNftUTXOs.length
        return this.$store.state.Assets.nftUTXOs.length
    }

    get collectionAmt(): number {
        let fams = this.$store.state.Assets.nftFams
        return fams.length
        // let count = 0
        // for (var col in this.nftDict) {
        //     count++
        // }
        // return count
    }

    get statusText(): string {
        let res = `${this.collectedAmt} collected from ${this.collectionAmt} Collections`
        return res
    }
}
</script>
<style scoped lang="scss">
@use '../../../../main';

.nft_col {
    p {
        font-size: 12px;
        color: var(--primary-color-light);
    }
}

$nft_w: 35px;

.nft_list {
    margin-top: 8px;
    //display: grid;
    //grid-template-columns: repeat(5, $nft_w);
    grid-gap: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    /*display: flex;*/
    /*flex-wrap: wrap;*/
}

.nft_item {
    position: relative;
    height: $nft_w;
    width: $nft_w;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--bg-light);
    display: flex;
    align-items: center;
    justify-content: center;
}

.dummy_item {
    opacity: 0.2;
}
</style>
