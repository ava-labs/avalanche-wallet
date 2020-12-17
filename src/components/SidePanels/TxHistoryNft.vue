<template>
    <div class="nft">
        <NftPayloadView :payload="payload" small="true" class="payload_view"></NftPayloadView>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Big from 'big.js'
import AvaAsset from '@/js/AvaAsset'
import { TransactionType } from '@/store/modules/history/types'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'

@Component({
    components: {
        NftPayloadView,
    },
})
export default class TxHistoryNft extends Vue {
    @Prop() payload!: string
}
</script>
<style scoped lang="scss">
@use '../../main';

.nft {
    margin-top: 4px;
}

.payload_view {
    height: 35px;
    width: 35px;
    border-radius: 4px;
}

.action {
    font-size: 12px;
    color: main.$primary-color-light;
}

@include main.medium-device {
    .amount {
        font-size: 14px;
    }
}
</style>
