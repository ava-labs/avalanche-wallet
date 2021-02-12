<template>
    <div class="evm_dropdown hover_border" :active="isPopup">
        <button @click="showPopup">
            {{ symbol }}
            <fa icon="caret-down" style="float: right"></fa>
        </button>
        <div class="list"></div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class EVMAssetDropdown extends Vue {
    isPopup = false

    get erc20Tokens() {
        return this.$store.getters['Assets/networkErc20Tokens']
    }

    get symbol() {
        return 'AVAX'
    }
    showPopup() {
        this.isPopup = true
    }
}
</script>
<style scoped lang="scss">
.evm_dropdown {
}

.evm_dropdown[active] {
}
</style>
