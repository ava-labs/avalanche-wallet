<template>
    <img ref="image_tag" :height="diameter" :width="diameter" />
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import makeBlockie from 'ethereum-blockies-base64'

@Component
export default class Identicon extends Vue {
    $refs!: {
        image_tag: HTMLImageElement
    }

    @Prop() value!: string
    @Prop({ default: 40 }) diameter!: number

    @Watch('value')
    onValueChange() {
        this.generateImage()
    }

    mounted() {
        this.generateImage()
    }

    generateImage() {
        let base64 = makeBlockie(this.value)
        this.$refs.image_tag.src = base64
    }
}
</script>
<style scoped lang="scss">
img {
    border-radius: 100%;
}
</style>
