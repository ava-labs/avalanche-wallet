<template>
    <div>
        <div>
            <h1>{{ $t('advanced.title') }}</h1>
        </div>
        <div class="grids">
            <ChainImport class="grid_box"></ChainImport>
            <SignMessage class="grid_box"></SignMessage>
            <VerifyMessage class="grid_box"></VerifyMessage>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import ChainImport from '@/components/wallet/advanced/ChainImport.vue'
import SignMessage from '@/components/wallet/advanced/SignMessage.vue'
import VerifyMessage from '@/components/wallet/advanced/VerifyMessage.vue'

@Component({
    name: 'advanced',
    components: {
        ChainImport,
        SignMessage,
        VerifyMessage,
    },
})
export default class Advanced extends Vue {}
</script>
<style scoped lang="scss">
@use '../../main';

h1 {
    font-weight: normal;
}
.grids {
    margin: 30px 0;
    display: grid;
    column-gap: 14px;
    row-gap: 14px;
    grid-template-columns: repeat(3, 1fr);
}

.v-btn {
    margin: 4px 0;
}

.grid_box {
    background-color: var(--bg-light);
    padding: 30px;
    border-radius: 4px;
}

@include main.mobile-device {
    .grids {
        grid-template-columns: none;
    }
}

@include main.medium-device {
    .grids {
        grid-template-columns: none;
    }
}
</style>
