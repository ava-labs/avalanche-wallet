<template>
    <p>{{ tweenedNumber.toLocaleString() }}</p>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import Big from 'big.js'

@Component
export default class NumberCounter extends Vue {
    tweenedNumber: Big = Big(0)
    @Prop() value!: Big

    @Watch('value')
    onValueChange(val) {
        this.animate()
    }

    animate() {
        let increment = this.value.gt(this.tweenedNumber)
        let diff = this.value.sub(this.tweenedNumber)
        let step = diff.div(4).abs()

        let thresh = Big(0.001)

        if (step.lt(thresh)) {
            this.tweenedNumber = this.value.add(0)
            return
        }

        if (increment) {
            this.tweenedNumber = this.tweenedNumber.add(step)
        } else {
            this.tweenedNumber = this.tweenedNumber.sub(step)
        }

        setTimeout(this.animate, 20)
    }

    mounted() {
        this.animate()
    }
}
</script>
