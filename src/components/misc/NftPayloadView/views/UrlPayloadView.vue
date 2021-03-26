<template>
    <div class="url_payload_view" @mouseenter="isHover = true" @mouseleave="isHover = false">
        <img :src="url" @load="isImage = true" v-show="isImage" />
        <video
            :src="url"
            @loadedmetadata="isVideo = true"
            v-show="isVideo"
            :controls="isHover"
            loop
            muted
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { URLPayload } from 'avalanche/dist/utils'

@Component
export default class UrlPayloadView extends Vue {
    @Prop() payload!: URLPayload

    img_types = ['jpeg', 'jpg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico', 'webp']
    valid_types = this.img_types.concat(['pdf'])
    isImage = false
    isVideo = false
    isHover = false
    get url() {
        return this.payload.getContent().toString()
    }

    get fileType(): string | null {
        let url = this.url

        let split = url.split('.')

        // Couldn't find extension
        if (split.length === 1) return null

        let extension: string = split[split.length - 1]

        if (!this.valid_types.includes(extension)) return null
        return extension
    }
}
</script>
<style scoped lang="scss">
.url_payload_view {
    //border-radius: 14px;
    //overflow: hidden;
}
img,
video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
}

.unknown {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.unknown,
.warn {
    background-color: var(--bg-light);
    text-align: center;
    padding: 12px 8px;
    word-break: break-all;
    font-size: 13px;
    span {
        color: var(--primary-color-light);
        font-size: 13px;
    }
}

.warn {
    color: var(--error);
    word-break: normal;
    font-size: 11px;
    opacity: 0.6;
}
</style>
