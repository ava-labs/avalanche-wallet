<template>
    <div class="utf_payload_view">
        <p><fa icon="font"></fa></p>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { UTF8Payload } from 'avalanche/dist/utils'

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
    font-size: 13px;
    color: var(--primary-color);
}
</style>
