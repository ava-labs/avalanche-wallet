<template>
    <div>
        <img :src="url" v-if="img_types.includes(fileType)" />
        <div v-else class="unknown">
            <p>
                <span>URL</span>
                {{ url }}
            </p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { URLPayload } from 'avalanche/dist/utils'

@Component
export default class UrlPayloadView extends Vue {
    @Prop() payload!: URLPayload

    img_types = ['jpeg', 'jpg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico']
    valid_types = this.img_types.concat(['pdf'])

    get url() {
        return this.payload.getContent().toString()
    }

    get fileType(): string | null {
        let url = this.url

        let split = url.split('.')

        // Couldn't find extension
        if (split.length === 1) return null

        let extension: string = split[split.length - 1]
        console.log(extension)

        if (!this.valid_types.includes(extension)) return null
        return extension
    }
}
</script>
<style scoped lang="scss">
img {
    width: 100%;
    /*height: 100%;*/
    object-fit: cover;
}

.unknown {
    text-align: center;
    padding: 12px 8px;
    span {
        color: var(--primary-color-light);
        font-size: 13px;
    }
}
</style>
