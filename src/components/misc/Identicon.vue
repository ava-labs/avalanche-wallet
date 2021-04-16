<template>
    <div class="identicon">
        <img :src="src" alt="" :height="diameter" :width="diameter" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { toDataUrl } from '@/js/blockies.js'

// import jazzicon from '@metamask/jazzicon'
// const iconFactoryGen = require('@/js/iconFactory')
// const iconFactory = iconFactoryGen(jazzicon)

@Component
export default class Identicon extends Vue {
    image: HTMLImageElement | null = null
    src!: string

    @Prop()
    address!: string
    @Prop({ default: 40 }) diameter!: number

    created() {
        this.generateBlockie(this.address)
    }
    generateBlockie(address: string) {
        this.src = toDataUrl(address)
    }
}
</script>
<style scoped lang="scss">
.identicon {
    img {
        border-radius: 100%;
    }
}
</style>
