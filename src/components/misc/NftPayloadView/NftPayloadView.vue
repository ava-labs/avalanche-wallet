<template>
    <Component v-if="!small" :is="viewer" :payload="payload" class="nft_payload_view"></Component>
    <Component v-else :is="viewerSmall" :payload="payload" class="nft_payload_view"></Component>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { PayloadBase } from 'avalanche/dist/utils'

import UrlPayloadView from '@/components/misc/NftPayloadView/views/UrlPayloadView.vue'
import UtfPayloadView from '@/components/misc/NftPayloadView/views/UtfPayloadView.vue'
import JsonPayloadView from '@/components/misc/NftPayloadView/views/JsonPayloadView.vue'

import UrlPayloadViewSmall from '@/components/misc/NftPayloadView/views_small/UrlPayloadView.vue'
import UtfPayloadViewSmall from '@/components/misc/NftPayloadView/views_small/UtfPayloadView.vue'
import JsonPayloadViewSmall from '@/components/misc/NftPayloadView/views_small/JsonPayloadView.vue'

@Component({
    components: {
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

    get viewer() {
        let typeID = this.payload.typeID()
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

    get viewerSmall() {
        let typeID = this.payload.typeID()
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
