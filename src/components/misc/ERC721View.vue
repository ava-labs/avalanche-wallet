<template>
    <div>
        <img :src="img" />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ERC721Token from '@/js/ERC721Token'
import axios from 'axios'

@Component
export default class ERC721View extends Vue {
    @Prop() index!: string
    @Prop() token!: ERC721Token
    metadata: any = {}

    mounted() {
        this.getData()
    }

    @Watch('token')
    @Watch('index')
    onIndexChange() {
        this.getData()
    }

    get img() {
        let data = this.metadata
        if (!data) return null
        return data.img || data.image || null
    }

    async getData() {
        this.metadata = await this.token.getTokenURIData(parseInt(this.index))
        // let uri = await this.token.getTokenURI(parseInt(this.index))
        // let res = (await axios.get(uri)).data
        // this.metadata = res
    }
}
</script>
<style scoped lang="scss">
img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
