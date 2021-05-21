<template>
    <img v-if="isDay" :src="day" />
    <img v-else :src="night" />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class ImageDayNight extends Vue {
    @Prop() day!: string
    @Prop() night!: string

    get isDay() {
        //@ts-ignore
        return this.$root.theme === 'day'
    }
}
</script>
<style scoped lang="scss"></style>
