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
                <div
                    class="nft_item"
                    v-for="item in ercNftBalanceArray"
                    :key="'ba_' + item.id.tokenId"
                >
                    <ERCNftView :token="item.token" :index="item.id"></ERCNftView>
                </div>
                <div v-for="i in dummyAmt" class="nft_item dummy_item" :key="i"></div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { IWalletNftDict } from '@/store/types'
import { NFTTransferOutput, UTXO } from '@c4tplatform/camino/dist/apis/avm'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import { Buffer } from '@c4tplatform/camino'
import { PayloadTypes } from '@c4tplatform/camino/dist/utils'
import { bintools } from '@/AVA'
import { ERCNftWalletBalance } from '@/store/modules/assets/modules/types'
import ERCNftView from '@/components/misc/ERCNftView.vue'
import { iERCNftSelectInput } from '@/components/misc/EVMInputDropdown/types'

const NFT_COUNT = 10

let payloadtypes = PayloadTypes.getInstance()

@Component({
    components: {
        ERCNftView,
        NftPayloadView,
    },
})
export default class NftCol extends Vue {
    get isEmpty(): boolean {
        return this.nftArray.length + this.ercNftBalanceArray.length === 0
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

    get ercNftBalance(): ERCNftWalletBalance {
        return this.$store.state.Assets.ERCNft.walletBalance
    }

    get ercNftBalanceArray() {
        // TODO: Remove after ledger support
        if (this.$store.state.activeWallet.type === 'ledger') return []

        let res: iERCNftSelectInput[] = []
        for (var tokenAddr in this.ercNftBalance) {
            let ercNftToken = this.$store.getters['Assets/ERCNft/find'](tokenAddr)
            let tokenIds = this.ercNftBalance[tokenAddr]
            let tokens = tokenIds.map((id) => {
                return {
                    token: ercNftToken,
                    id,
                }
            })
            res.push(...tokens)
        }
        return res.slice(0, NFT_COUNT - this.nftArray.length)
    }

    get dummyAmt(): number {
        return NFT_COUNT - (this.nftArray.length + this.ercNftBalanceArray.length)
    }

    get collectedAmt(): number {
        let avmAmt = this.$store.state.Assets.nftUTXOs.length
        let evmAmt = this.$store.getters['Assets/ERCNft/totalOwned']
        return avmAmt + evmAmt
    }

    get collectionAmt(): number {
        let avmFamsAmt = this.$store.state.Assets.nftFams.length
        let evmFamsAmt = this.$store.getters['Assets/ERCNft/totalCollectionsOwned']
        return avmFamsAmt + evmFamsAmt
    }

    get statusText(): string {
        let res = `${this.collectedAmt} collected from ${this.collectionAmt} Collections`
        return res
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.nft_col {
    margin-top: 10px;
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
    grid-template-columns: repeat(auto-fill, $nft_w);
}

.nft_item {
    position: relative;
    height: $nft_w;
    width: $nft_w;
    border-radius: var(--border-radius-sm);
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
