<template>
    <div class="utf_payload_view" @mouseenter="mouseEnter" @mouseleave="mouseLeave" ref="view">
        <p class="icon"><fa icon="font"></fa></p>
        <p class="hover_text" v-show="isText" ref="text">{{ text }}</p>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { UTF8Payload } from '@c4tplatform/camino/dist/utils'

@Component
export default class UtfPayloadView extends Vue {
    @Prop() payload!: UTF8Payload
    isText = false

    $refs!: {
        text: HTMLElement
        view: HTMLElement
    }
    mouseEnter() {
        this.showText()
    }

    mouseLeave() {
        this.isText = false
    }

    showText() {
        let pos: HTMLElement = this.$refs.view
        let rect = pos.getBoundingClientRect()

        this.$refs.text.style.top = rect.y + rect.height + 'px'
        this.$refs.text.style.left = rect.x + 'px'
        this.isText = true
    }

    get text() {
        return this.payload.getContent()
    }
}
</script>
<style scoped lang="scss">
.utf_payload_view {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
        .icon {
            color: var(--primary-color-light) !important;
        }
    }
}
p {
    font-size: 13px;
    color: var(--primary-color) !important;
}

.hover_text {
    top: 100px;
    z-index: 99;
    position: fixed;
    background-color: var(--primary-color);
    padding: 3px 12px;
    border: 1px solid var(--bg);
    color: var(--bg) !important;
    transition-duration: 0.2s;
    border-radius: 3px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
