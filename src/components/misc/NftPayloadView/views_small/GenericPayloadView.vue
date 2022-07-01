<!--Used inside the JsonPayload.vue component-->

<template>
    <div class="generic_payload_view">
        <template v-if="!isError">
            <div class="generic_view">
                <img :src="img" @load="isImage = true" v-show="isImage" />
                <video
                    :src="img"
                    @loadedmetadata="isVideo = true"
                    v-show="isVideo"
                    muted
                    controlsList="nodownload"
                />
            </div>
        </template>
        <template v-else>
            <p>Failed to load generic collectible payload.</p>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { JSONPayload } from '@c4tplatform/camino/dist/utils'
import { IGenericNft } from '@/components/wallet/studio/mint/types'

@Component
export default class UtfPayloadView extends Vue {
    @Prop() payload!: JSONPayload
    isError = false
    jsonData: IGenericNft | null = null
    isImage = false
    isVideo = false

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

    // get data() {
    //     return JSON.parse(this.content)
    // }
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
.generic_payload_view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.generic_view {
    position: relative;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
}
p {
    font-size: 13px;
    word-break: break-word;
    overflow: scroll;
    background-color: var(--bg-light);
    color: var(--primary-color);
}

img,
video {
    display: block;
    object-fit: cover;
    object-position: center;
    width: 100%;
    height: 100%;
    position: absolute;
}

.nft_title {
    position: absolute;
    bottom: 0;
    width: 100%;
    font-size: 13px;
    background-color: #000000aa;
    color: #fff;
    transition-duration: 0.2s;
}

.generic_view:hover {
    .desc {
        opacity: 1;
    }
    .nft_title {
        opacity: 0;
    }
}
.desc {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    font-size: 13px;
    transition-duration: 0.2s;
    color: #fff;
    text-align: center;
    padding: 14px;
    background-color: #000000bb;
}
</style>
