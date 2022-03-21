<template>
    <v-banner sticky class="url_banner" color="#f00" ref="banner">
        <template v-slot:default>
            <fa icon="exclamation-triangle"></fa>
            Make sure the URL is
            <b>wallet.camino.foundation</b>
            <button @click="dismiss" class="dismiss_but" data-cy="dismiss_banner">
                <fa icon="times"></fa>
            </button>
        </template>
    </v-banner>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class UrlBanner extends Vue {
    dismiss() {
        //@ts-ignore
        this.$refs.banner.toggle()
    }
}
</script>
<style scoped lang="scss">
.url_banner {
    background-color: #1d82bb;
    color: #fff;
    z-index: 3 !important;

    .dismiss_but {
        margin-right: 8px;
        float: right;
    }
}
</style>
