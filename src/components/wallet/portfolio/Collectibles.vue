<template>
    <div class="collectibles_view no_scroll_bar" @scroll="onScroll" :scroll="isScroll">
        <AddERC721TokenModal ref="add_token_modal"></AddERC721TokenModal>
        <div v-if="!isEmpty" class="list">
            <CollectibleFamilyRow
                v-for="fam in nftFamsArray"
                :key="fam.id"
                :family="fam"
            ></CollectibleFamilyRow>
            <ERC721FamilyRow
                v-for="token in erc721s"
                :key="token.contractAddress"
                :family="token"
            ></ERC721FamilyRow>
            <div class="add_token_row">
                <button @click="showModal">Add Collectible</button>
            </div>
        </div>
        <div class="coming_soon" v-else>
            <!--            <img v-if="$root.theme === 'day'" src="@/assets/nft_preview.png" />-->
            <!--            <img v-else src="@/assets/nft_preview_night.png" />-->
            <p>{{ $t('portfolio.nobalance_nft') }}</p>
            <div class="add_token_row">
                <button @click="showModal">Add Collectible</button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import NFTCard from './NftCard.vue'
import CollectibleFamilyRow from '@/components/wallet/portfolio/CollectibleFamilyRow.vue'
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { IWalletNftDict, IWalletNftMintDict } from '@/store/types'
import { AvaNftFamily } from '@/js/AvaNftFamily'
import { NftFamilyDict } from '@/store/modules/assets/types'
import AddERC721TokenModal from '@/components/modals/AddERC721TokenModal.vue'
import ERC721Token from '@/js/ERC721Token'
import ERC721FamilyRow from '@/components/wallet/portfolio/ERC721FamilyRow.vue'
import { WalletType } from '@/js/wallets/types'

// const payloadTypes = PayloadTypes.getInstance();
@Component({
    components: {
        ERC721FamilyRow,
        AddERC721TokenModal,
        NFTCard,
        CollectibleFamilyRow,
    },
})
export default class Collectibles extends Vue {
    @Prop() search!: string
    isScroll = false

    $refs!: {
        add_token_modal: AddERC721TokenModal
    }

    get isEmpty(): boolean {
        // let nftUtxos = this.$store.getters.walletNftUTXOs.length
        // let mintUTxos = this.$store.getters.walletNftMintUTXOs.length
        let nftUtxos = this.$store.state.Assets.nftUTXOs.length
        let mintUTxos = this.$store.state.Assets.nftMintUTXOs.length
        let erc721Bal = this.$store.getters['Assets/ERC721/totalOwned']
        return nftUtxos + mintUTxos + erc721Bal === 0
    }

    get nftDict(): IWalletNftDict {
        // return this.$store.getters.walletNftDict
        let dict = this.$store.getters['Assets/walletNftDict']
        return dict
    }

    get nftMintDict(): IWalletNftMintDict {
        // let dict = this.$store.getters.walletNftMintDict
        let dict = this.$store.getters['Assets/nftMintDict']
        return dict
    }

    get nftFamsArray() {
        let fams: AvaNftFamily[] = this.$store.state.Assets.nftFams

        // If search query
        if (this.search) {
            let query = this.search
            fams = fams.filter((fam) => {
                if (
                    fam.name.includes(query) ||
                    fam.id.includes(query) ||
                    fam.symbol.includes(query)
                ) {
                    return true
                }
                return false
            })
        }

        fams.sort((a, b) => {
            let symbolA = a.symbol
            let symbolB = b.symbol

            if (symbolA < symbolB) {
                return -1
            } else if (symbolA > symbolB) {
                return 1
            }
            return 0
        })

        return fams
    }

    get nftFamsDict(): NftFamilyDict {
        let dict = this.$store.state.Assets.nftFamsDict
        return dict
    }

    get erc721s(): ERC721Token[] {
        let w: WalletType = this.$store.state.activeWallet
        return this.$store.getters['Assets/ERC721/networkContracts']
    }

    onScroll(ev: any) {
        let val = ev.target.scrollTop
        if (val > 0) {
            this.isScroll = true
        } else {
            this.isScroll = false
        }
    }

    showModal() {
        this.$refs.add_token_modal.open()
    }
}
</script>
<style lang="scss" scoped>
@use '../../../main';
@use './portfolio';

$flip_dur: 0.6s;

.collectibles_view {
    height: 100%;
    overflow: scroll;
    transition-duration: 0.2s;
    border-top: 0px solid transparent;
    &[scroll] {
        border-top: 3px solid var(--bg-wallet);
    }
}

.list {
    max-height: 50px;
}

.coming_soon {
    padding-top: 60px;
    text-align: center;
    img {
        width: 100%;
        max-width: 560px;
    }

    p {
        font-weight: lighter;
        font-size: 28px;
        color: var(--primary-color-light);
    }
}

.nft_card {
    transition-duration: 0.3s;
    width: 140px;
    height: 220px;
}

@include main.mobile-device {
    .collectibles_view {
        height: 90vh;
    }
}
</style>
