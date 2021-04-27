<template>
    <div class="erc721_view">
        <img :src="img" v-if="!isError && img" />
        <div v-if="isError" class="err_cont">
            <p>
                <fa icon="unlink"></fa>
            </p>
        </div>
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
    isError = false

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
        try {
            this.metadata = await this.token.getTokenURIData(parseInt(this.index))
            this.isError = false
        } catch (e) {
            this.isError = true
        }
        // let uri = await this.token.getTokenURI(parseInt(this.index))
        // let res = (await axios.get(uri)).data
        // this.metadata = res
    }
}
</script>
<style scoped lang="scss">
.erc721_view {
    width: 100%;
    height: 100%;
}
img,
.err_cont {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.err_cont {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #000;
    text-align: center;
}
</style>
