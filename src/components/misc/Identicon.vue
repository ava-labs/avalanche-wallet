<template>
    <canvas ref="canvas"></canvas>
</template>
<script>
import * as jdenticon from 'jdenticon'

export default {
    props: {
        hash: {
            type: String,
            required: true,
        },
    },
    methods: {
        generateIdenticon() {
            let canv = this.$refs['canvas']
            let cont = canv.getContext('2d')
            let text = this.payload.toString('hex')
            jdenticon.drawIcon(cont, text, canv.width)
        },
    },
}
</script>
<style scoped lang="scss">
canvas {
}
</style>
