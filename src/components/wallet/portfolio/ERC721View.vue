<template>
    <div class="nft_card">
        <div class="view">
            <template v-if="!isRaw">
                <img :src="img" v-if="img" />
            </template>
            <template v-else>
                <div class="raw_view no_scroll_bar">
                    <p>{{ data }}</p>
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
@Component({
    components: { Tooltip },
})
export default class ERC721View extends Vue {
    @Prop() url!: string
    data: any = ''
    isRaw = false

    mounted() {
        this.getData()
    }

    get img() {
        let data = this.data
        if (!data) return null
        return data.img || data.image || null
    }

    get name() {
        return this.data?.name
    }

    get description() {
        return this.data?.description
    }

    async getData() {
        let res = (await axios.get(this.url)).data
        console.log(res)
        this.data = res
    }

    transfer() {}
    expand() {}

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
    background-color: #111;
    height: 100%;
    padding: 12px;
    font-size: 12px;
    word-break: break-all;
    color: var(--success);
}

.raw_toggle {
    &[active] {
        color: var(--secondary-color) !important;
        opacity: 1 !important;
        font-weight: bold;
    }
}
</style>
