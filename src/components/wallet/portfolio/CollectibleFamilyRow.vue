<template>
    <div></div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AvaNftFamily } from '@/js/AvaNftFamily'

@Component
export default class CollectibleFamilyRow extends Vue {
    @Prop() family!: AvaNftFamily
}
</script>
