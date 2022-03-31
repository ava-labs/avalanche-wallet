<template>
    <div class="network_warning" :visible="isVisible">
        <p>{{ $t('network.not_mainnet') }}</p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class TestNetBanner extends Vue {
    get isVisible() {
        let network = this.$store.state.Network.selectedNetwork
        if (!network) return false
        let netId = parseInt(network.networkId)

        if (netId == 1) return false
        return true
    }
}
</script>
<style scoped lang="scss">
$h: 24px;
.network_warning {
    background-color: var(--secondary-color);
    color: #fff;
    font-size: 13px;
    text-align: center;
    position: fixed;
    bottom: -$h;
    width: 100%;
    height: $h;
    line-height: $h;
    z-index: 2;
    transition-duration: 0.4s;

    &[visible] {
        bottom: 0px;
    }
}
</style>
