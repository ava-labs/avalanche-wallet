<template>
    <div class="nft_payload_view" v-if="isBanned"></div>
    <NftPayloadAllow
        v-model="isShow"
        v-else-if="!isShow"
        :is-small="small"
        :nft-i-d="payloadID"
    ></NftPayloadAllow>
    <Component
        :is="viewer"
        :payload="payload"
        class="nft_payload_view"
        v-else-if="!small"
    ></Component>
    <Component v-else :is="viewerSmall" :payload="payload" class="nft_payload_view"></Component>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'

import UrlPayloadView from '@/components/misc/NftPayloadView/views/UrlPayloadView.vue'
import UtfPayloadView from '@/components/misc/NftPayloadView/views/UtfPayloadView.vue'
import JsonPayloadView from '@/components/misc/NftPayloadView/views/JsonPayloadView.vue'

import UrlPayloadViewSmall from '@/components/misc/NftPayloadView/views_small/UrlPayloadView.vue'
import UtfPayloadViewSmall from '@/components/misc/NftPayloadView/views_small/UtfPayloadView.vue'
import JsonPayloadViewSmall from '@/components/misc/NftPayloadView/views_small/JsonPayloadView.vue'
import NftPayloadAllow from '@/components/misc/NftPayloadView/NftPayloadAllow.vue'
import { isUrlBanned } from '@/components/misc/NftPayloadView/blacklist'
import { payloadToHash } from '@/utils/payloadToHash'

@Component({
    components: {
        NftPayloadAllow,
        UrlPayloadView,
        UtfPayloadView,
        JsonPayloadView,
        UrlPayloadViewSmall,
        UtfPayloadViewSmall,
        JsonPayloadViewSmall,
    },
})
export default class NftPayloadView extends Vue {
    @Prop() payload!: PayloadBase
    @Prop({ default: false }) small!: boolean

    isShow = false

    get nftWhitelist() {
        return this.$store.state.Assets.nftWhitelist
    }

    get payloadID() {
        const str = this.payload.getContent().toString()
        return payloadToHash(str)
    }

    @Watch('nftWhitelist')
    onListChange() {
        if (this.nftWhitelist.includes(this.payloadID)) {
            this.isShow = true
        }
    }

    mounted() {
        if (this.nftWhitelist) {
            this.onListChange()
        }
    }

    get viewer() {
        let typeID = this.typeID
        switch (typeID) {
            case 1: // UTF 8
                return UtfPayloadView
            case 27: // url
                return UrlPayloadView
            case 24: // JSON
                return JsonPayloadView
            default:
                return UtfPayloadView
        }
    }

    get content() {
        return this.payload.getContent().toString()
    }

    get isBanned() {
        return isUrlBanned(this.content)
    }

    get typeID() {
        return this.payload.typeID()
    }

    get viewerSmall() {
        let typeID = this.typeID
        switch (typeID) {
            case 1: // UTF 8
                return UtfPayloadViewSmall
            case 27: // url
                return UrlPayloadViewSmall
            case 24: // JSON
                return JsonPayloadViewSmall
            default:
                return UtfPayloadViewSmall
        }
    }
}
</script>
<style scoped>
.nft_payload_view {
    overflow: auto;
}
</style>
