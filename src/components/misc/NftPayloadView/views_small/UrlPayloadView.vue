<template>
    <div class="url_payload_view">
        <img :src="url" @load="isImage = true" v-show="isImage" />
        <video
            :src="url"
            @loadedmetadata="isVideo = true"
            v-show="isVideo"
            muted
            controlsList="nodownload"
        />
        <div v-if="!isVideo && !isImage" class="unknown">
            <p><fa icon="link"></fa></p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { URLPayload } from '@c4tplatform/camino/dist/utils'

@Component
export default class UrlPayloadView extends Vue {
    @Prop() payload!: URLPayload

    img_types = ['jpeg', 'jpg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico', 'webp']
    valid_types = this.img_types.concat(['pdf'])
    isImage = false
    isVideo = false

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
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    //border-radius: 14px;
    //overflow: hidden;
}

img,
video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.unknown {
    background-color: var(--bg-light);
    text-align: center;
}
</style>
