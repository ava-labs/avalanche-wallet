<template>
    <div class="nft_card">
        <ERC721ViewModal :token="token" :token-id="index" ref="view_modal"></ERC721ViewModal>
        <div class="view">
            <template v-if="!isRaw && img">
                <ERC721View :token="token" :index="index"></ERC721View>
            </template>
            <template v-else>
                <div class="raw_view no_scroll_bar">
                    <p>{{ metadata }}</p>
                </div>
            </template>
        </div>
        <div class="nft_info">
            <div class="meta_bar">
                <div>
                    <p>ERC721</p>
                </div>
                <div>
                    <button @click="toggleRaw" :active="isRaw" class="raw_toggle">SOURCE</button>
                    <Tooltip
                        :text="$t('portfolio.collectibles.send')"
                        @click.native="transfer"
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
            <div class="generic_nft_meta" v-if="name || description">
                <p class="nft_title" v-if="name">
                    {{ name }}
                </p>
                <p class="nft_desc" v-if="description">
                    {{ description }}
                </p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import axios from 'axios'
import Tooltip from '@/components/misc/Tooltip.vue'
import ERC721Token from '@/js/ERC721Token'
import ERC721View from '@/components/misc/ERC721View.vue'
import ERC721ViewModal from '@/components/modals/ERC721ViewModal.vue'
@Component({
    components: { ERC721ViewModal, ERC721View, Tooltip },
})
export default class ERC721Card extends Vue {
    @Prop() index!: string
    @Prop() token!: ERC721Token

    $refs!: {
        view_modal: ERC721ViewModal
    }

    metadata: any = ''
    isRaw = false

    mounted() {
        this.getData()
    }

    get img() {
        let data = this.metadata
        if (!data) return null
        return data.img || data.image || null
    }

    get name() {
        return this.metadata?.name
    }

    get description() {
        return this.metadata?.description
    }

    async getData() {
        try {
            let uri = await this.token.getTokenURI(parseInt(this.index))
            this.metadata = (await axios.get(uri)).data
        } catch (e) {
            this.metadata = null
        }
    }

    transfer(ev: any) {
        ev.stopPropagation()
        this.$router.push({
            path: '/wallet/transfer',
            query: {
                chain: 'C',
                token: this.token.contractAddress,
                tokenId: this.index,
            },
        })
    }
    expand() {
        this.$refs.view_modal.open()
    }

    toggleRaw() {
        this.isRaw = !this.isRaw
    }
}
</script>
<style scoped lang="scss">
@use 'nft_card';

img {
    width: 100%;
    object-fit: contain;
}

.raw_view {
    overflow: scroll;
    background-color: #000;
    height: 100%;
    padding: 12px;
    font-size: 12px;
    word-break: break-all;
    color: #0f0;
    font-family: monospace !important;
}

.raw_toggle {
    &[active] {
        color: var(--secondary-color) !important;
        opacity: 1 !important;
        font-weight: bold;
    }
}
</style>
