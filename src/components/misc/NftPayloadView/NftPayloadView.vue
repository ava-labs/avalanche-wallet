<template>
    <Component :is="viewer" :payload="payload"></Component>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { PayloadBase } from 'avalanche/dist/utils'

import UrlPayloadView from '@/components/misc/NftPayloadView/UrlPayloadView.vue'

@Component({
    components: {
        UrlPayloadView,
    },
})
export default class NftPayloadView extends Vue {
    @Prop() payload!: PayloadBase

    get viewer() {
        let typeID = this.payload.typeID()
        switch (typeID) {
            case 1: // UTF 8
                return UrlPayloadView
            case 27: // url
                return UrlPayloadView
            default:
                return UrlPayloadView
        }
    }
}
</script>
