<template>
    <div class="nft_col">
        <h4>{{ $t('top.balance.collectibles') }}</h4>
        <p v-if="isEmpty">{{ $t('top.nftempty') }}</p>
        <div v-else class="rows">
            <p>{{ statusText }}</p>
            <div class="nft_list">
                <div class="nft_item" v-for="(utxo, i) in nftArray" :key="utxo.getUTXOID()">
                    <NftPayloadView :payload="nftPayloads[i]" small="true"></NftPayloadView>
                </div>
                <div class="nft_item" v-for="item in erc721BalanceArray" :key="item.id">
                    <ERC721View :token="item.token" :index="item.id"></ERC721View>
                </div>
                <div v-for="i in dummyAmt" class="nft_item dummy_item" :key="i"></div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from 'vue-property-decorator'
import { IWalletNftDict } from '@/store/types'
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import NftCard from '@/components/wallet/portfolio/NftCard.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from 'avalanche/dist/utils'
import { Buffer } from 'avalanche'
import { PayloadTypes } from 'avalanche/dist/utils'
import { bintools } from '@/AVA'
import NftFamilyCardsPreview from '@/components/misc/NftFamilyCardsPreview.vue'
import { ERC721WalletBalance } from '@/store/modules/assets/modules/types'
import ERC721View from '@/components/misc/ERC721View.vue'

const NFT_COUNT = 15

let payloadtypes = PayloadTypes.getInstance()

@Component({
    components: {
        ERC721View,
        NftFamilyCardsPreview,
        NftCard,
        NftPayloadView,
    },
})
export default class NftCol extends Vue {
    get isEmpty(): boolean {
        return this.nftArray.length + this.erc721BalanceArray.length === 0
    }

    get nftDict(): IWalletNftDict {
        return this.$store.getters['Assets/walletNftDict']
    }

    get nftArray(): UTXO[] {
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

        return utxos.slice(0, NFT_COUNT)
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

    get erc721Balance(): ERC721WalletBalance {
        return this.$store.state.Assets.ERC721.walletBalance
    }

    get erc721BalanceArray() {
        // TODO: Remove after ledger support
        if (this.$store.state.activeWallet.type === 'ledger') return []

        let res = []
        for (var tokenAddr in this.erc721Balance) {
            let erc721Token = this.$store.getters['Assets/ERC721/find'](tokenAddr)
            let tokenIds = this.erc721Balance[tokenAddr]
            let tokens = tokenIds.map((id) => {
                return {
                    token: erc721Token,
                    id: id,
                }
            })
            res.push(...tokens)
        }
        return res.slice(0, NFT_COUNT - this.nftArray.length)
    }

    get dummyAmt(): number {
        return NFT_COUNT - (this.nftArray.length + this.erc721BalanceArray.length)
    }

    get collectedAmt(): number {
        let avmAmt = this.$store.state.Assets.nftUTXOs.length
        let evmAmt = this.$store.getters['Assets/ERC721/totalOwned']
        return avmAmt + evmAmt
    }

    get collectionAmt(): number {
        let avmFamsAmt = this.$store.state.Assets.nftFams.length
        let evmFamsAmt = this.$store.getters['Assets/ERC721/totalCollectionsOwned']
        return avmFamsAmt + evmFamsAmt
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
    grid-gap: 8px;
    display: grid;
    grid-template-columns: repeat(5, $nft_w);
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

.cards_cont {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
