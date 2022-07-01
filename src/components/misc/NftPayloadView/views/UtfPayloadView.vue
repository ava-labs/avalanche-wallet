<template>
    <div class="utf_payload_view">
        <p>{{ text }}</p>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { UTF8Payload } from '@c4tplatform/camino/dist/utils'

@Component
export default class UtfPayloadView extends Vue {
    @Prop() payload!: UTF8Payload

    get text() {
        return this.payload.getContent()
    }
}
</script>
<style scoped lang="scss">
p {
    height: 100%;
    font-size: 13px;
    padding: 12px 24px;
    word-break: break-word;
    overflow: scroll;
    background-color: var(--bg-light) !important;
    color: var(--primary-color) !important;
}
</style>
