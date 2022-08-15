<!--Used inside the JsonPayload.vue component-->

<template>
    <div class="generic_payload_view">
        <div
            v-if="!isError"
            class="payload_rows"
            @mouseenter="isHover = true"
            @mouseleave="isHover = false"
        >
            <div class="generic_view">
                <img :src="img" @load="isImage = true" v-show="isImage" />
                <video
                    :src="img"
                    @loadedmetadata="onVideoMeta"
                    v-show="isVideo"
                    :controls="isHover"
                    loop
                    muted
                    controlsList="nodownload"
                />
            </div>
        </div>
        <div v-else>
            <p>Failed to load generic collectible payload.</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { JSONPayload } from '@c4tplatform/camino/dist/utils'
import { IGenericNft } from '@/components/wallet/studio/mint/types'

@Component
export default class UtfPayloadView extends Vue {
    $refs!: {
        image: HTMLImageElement
        video: HTMLVideoElement
    }
    @Prop() payload!: JSONPayload

    isVideo = false
    isImage = false
    isAudio = false

    isError = false
    jsonData: IGenericNft | null = null
    isHover = false

    get content(): string {
        return this.payload.getContent().toString()
    }

    get desc() {
        return this.jsonData?.desc
    }

    get img() {
        return this.jsonData?.img
    }

    get title() {
        return this.jsonData?.title
    }

    onVideoMeta(ev: any) {
        this.isVideo = true
    }

    mounted() {
        try {
            this.jsonData = JSON.parse(this.content).avalanche
        } catch (e) {
            this.isError = true
        }
    }

    @Watch('payload')
    onPayloadChange(val: JSONPayload) {
        try {
            this.jsonData = JSON.parse(this.content).avalanche
        } catch (e) {
            this.isError = true
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.generic_payload_view {
    position: relative;
}
.generic_view {
    position: relative;
    width: 100%;
    //height: 100%;
    flex-grow: 1;
    overflow: auto;
}

.generic_meta {
    position: absolute;
    border-top: 2px solid var(--bg-light);
    padding: 16px 12px;
    height: 100%;
    width: 100%;
    background-color: #000d;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

img,
video {
    display: block;
    object-fit: contain;
    width: 100%;
    height: 100%;
    outline: none;
    //position: absolute;
}

.payload_rows {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.nft_title {
    font-size: 1.2em;
    text-align: left;
    font-weight: bold;
}

.desc {
    margin-top: 4px;
    font-size: 13px;
}

@include main.mobile-device {
}
</style>
