<template>
    <div class="nft_allow">
        <button @click="show" v-if="!isSmall">
            <fa icon="eye"></fa>
            <br />
            Show
        </button>
        <button @click="show" v-else>
            <fa icon="eye"></fa>
        </button>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Model, Prop } from 'vue-property-decorator'

@Component
export default class NftPayloadAllow extends Vue {
    @Prop({}) nftID!: string
    @Prop({ default: false }) isSmall!: boolean
    @Model('change', { type: Boolean }) readonly isShow!: boolean

    show() {
        this.$store.commit('Assets/whitelistNFT', this.nftID)
        this.$emit('change', true)
    }
}
</script>
<style scoped lang="scss">
.nft_allow {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-light);

    button {
        font-size: 0.8em;
        opacity: 0.5;

        &:hover {
            opacity: 1;
        }
    }
}
</style>
