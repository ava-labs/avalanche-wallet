<template>
    <div class="utf_payload_view">
        <p>{{ text }}</p>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { JSONPayload } from 'avalanche/dist/utils'

@Component
export default class JsonPayloadView extends Vue {
    @Prop() payload!: JSONPayload

    get text() {
        return this.payload.getContent()
    }
}
</script>
<style scoped lang="scss">
p {
    font-size: 13px;
    padding: 12px 24px;
    word-break: break-word;
    overflow: scroll;
    background-color: var(--bg-light);
    color: var(--primary-color);
}
</style>
