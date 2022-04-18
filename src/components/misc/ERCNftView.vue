<template>
    <div class="ercNft_view">
        <img :src="parseURL(img)" v-if="!isError && img" />
        <div v-if="isError" class="err_cont">
            <p>
                <fa icon="unlink"></fa>
            </p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ERCNftToken from '@/js/ERCNftToken'
import { ERCNftBalance } from '@/store/modules/assets/modules/types'

// If an image url is hosted on one of these urls, reroute through cloudflare.
const REDIRECT_DOMAINS = ['gateway.pinata.cloud/ipfs']
const CF_IPFS_BASE = 'https://cloudflare-ipfs.com/ipfs/'
@Component
export default class ERCNftView extends Vue {
    @Prop() index!: ERCNftBalance
    @Prop() token!: ERCNftToken
    metadata: any = {}
    isError = false

    mounted() {
        this.getData()
    }

    @Watch('token')
    @Watch('index')
    onIndexChange() {
        this.getData()
    }

    parseURL(val: string) {
        let isRedirect = REDIRECT_DOMAINS.reduce((acc, domain) => {
            if (acc) return acc
            if (val.includes(domain)) return true
            return false
        }, false)

        if (isRedirect) {
            let ipfsHash = val.split('ipfs/')[1]
            return CF_IPFS_BASE + ipfsHash
        }
        return val
    }

    get img() {
        let data = this.metadata
        if (!data) return null
        return data.img || data.image || null
    }

    async getData() {
        try {
            this.metadata = await this.token.getTokenURIData(parseInt(this.index.tokenId))
            this.isError = false
        } catch (e) {
            this.isError = true
        }
    }
}
</script>
<style scoped lang="scss">
.ercNft_view {
    width: 100%;
    height: 100%;
}
img,
.err_cont {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.err_cont {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #000;
    text-align: center;
}
</style>
