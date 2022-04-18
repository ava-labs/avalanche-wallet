<template>
    <div class="nft_card">
        <p class="count" v-if="index.quantity > 1">{{ index.quantity }}</p>
        <ERCNftViewModal :token="token" :index="index" ref="view_modal"></ERCNftViewModal>
        <div class="view">
            <template v-if="!isRaw && img">
                <ERCNftView :token="token" :index="index"></ERCNftView>
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
                    <p>{{ ercNftType }}</p>
                </div>
                <div>
                    <button @click="toggleRaw" :active="isRaw" class="raw_toggle">SOURCE</button>
                    <Tooltip
                        :text="$t('portfolio.collectibles.send')"
                        contentClass="mobile_hidden"
                        @click.native="transfer"
                        class="nft_button"
                    >
                        <fa icon="share"></fa>
                    </Tooltip>
                    <Tooltip
                        :text="$t('portfolio.collectibles.expand')"
                        contentClass="mobile_hidden"
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
import ERCNftToken from '@/js/ERCNftToken'
import ERCNftView from '@/components/misc/ERCNftView.vue'
import ERCNftViewModal from '@/components/modals/ERCNftViewModal.vue'
import { ERCNftBalance } from '@/store/modules/assets/modules/types'
@Component({
    components: { ERCNftViewModal, ERCNftView, Tooltip },
})
export default class ERCNftCard extends Vue {
    @Prop() index!: ERCNftBalance
    @Prop() token!: ERCNftToken

    $refs!: {
        view_modal: ERCNftViewModal
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

    get ercNftType() {
        return this.token.data.type
    }

    async getData() {
        try {
            let uri = await this.token.getTokenURI(parseInt(this.index.tokenId))
            let res = (await axios.get(uri)).data
            this.metadata = res
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
                token: this.token.data.address,
                tokenId: this.index.tokenId,
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
