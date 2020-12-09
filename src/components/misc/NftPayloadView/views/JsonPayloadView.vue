<template>
    <div class="json_payload_view">
        <!--        <p>{{ text }}</p>-->
        <textarea cols="30" row="200" v-model="val" disabled></textarea>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { JSONPayload } from 'avalanche/dist/utils'

@Component
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
            console.log(obj)
            return JSON.stringify(obj, undefined, 4)
        } catch (e) {
            console.log(e)
            return data
        }
    }
    get text() {
        return this.payload.getContent()
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
    overflow: scroll;
}
textarea {
    display: block;
    padding: 12px;
    min-height: 140px;
    font-size: 12px !important;
    background-color: #000;
    font-family: monospace;
    color: #0f0;
}
p {
    font-size: 13px;
    padding: 12px 24px;
    word-break: break-word;
    overflow: scroll;
    background-color: var(--bg-light);
    color: var(--primary-color);
}
</style>
