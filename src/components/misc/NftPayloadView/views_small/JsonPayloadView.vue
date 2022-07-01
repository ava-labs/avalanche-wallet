<template>
    <div v-if="!isGeneric" class="json_payload_view">
        <p>{ }</p>
    </div>
    <GenericPayloadViewSmall v-else :payload="payload"></GenericPayloadViewSmall>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { JSONPayload } from '@c4tplatform/camino/dist/utils'

import GenericPayloadViewSmall from '@/components/misc/NftPayloadView/views_small/GenericPayloadView.vue'

@Component({
    components: {
        GenericPayloadViewSmall,
    },
})
export default class JsonPayloadView extends Vue {
    @Prop() payload!: JSONPayload
    val = ''

    updateText() {
        this.val = this.jsonText
    }

    get jsonText() {
        let data = this.text
        try {
            let obj = JSON.parse(data)
            return JSON.stringify(obj, undefined, 4)
        } catch (e) {
            return data
        }
    }
    get text(): string {
        return this.payload.getContent().toString()
    }

    get isGeneric() {
        let data = this.text
        try {
            let obj = JSON.parse(data)

            if (obj.hasOwnProperty('avalanche')) {
                return true
            } else {
                return false
            }
        } catch (e) {
            return false
        }
        return false
    }

    @Watch('payload')
    onPayloadChange() {
        this.updateText()
    }

    mounted() {
        this.updateText()
    }
}
</script>
<style scoped lang="scss">
.json_payload_view {
    color: #0f0 !important;
    background-color: #000 !important;
    height: 100%;
    width: 100%;
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;

    p {
        color: #0f0 !important;
        font-size: 16px;
        word-break: break-word;
        font-weight: bold;
    }
}
</style>
