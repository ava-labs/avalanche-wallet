<template>
    <Component :is="viewer" :payload="payload" class="nft_payload_view"></Component>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { PayloadBase } from 'avalanche/dist/utils'

import UrlPayloadView from '@/components/misc/NftPayloadView/UrlPayloadView.vue'
import UtfPayloadView from '@/components/misc/NftPayloadView/UtfPayloadView.vue'

@Component({
    components: {
        UrlPayloadView,
        UtfPayloadView,
    },
})
export default class NftPayloadView extends Vue {
    @Prop() payload!: PayloadBase

    get viewer() {
        let typeID = this.payload.typeID()
        switch (typeID) {
            case 1: // UTF 8
                return UtfPayloadView
            case 27: // url
                return UrlPayloadView
            default:
                return UrlPayloadView
        }
    }
}
</script>
<style scoped>
.nft_payload_view {
    overflow: auto;
}
</style>
