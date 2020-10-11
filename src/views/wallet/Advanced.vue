<template>
    <div>
        <div class="header">
            <h1>{{$t('advanced.title')}}</h1>
        </div>
        <div class="grids">
            <ChainImport class="grid_box"></ChainImport>
        </div>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

import ChainImport from "@/components/wallet/advanced/ChainImport.vue";

@Component({
    name: "advanced",
    components: {
        ChainImport
    }
})
export default class Earn extends Vue{

}
</script>
<style scoped lang="scss">
.grids{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.v-btn{
    margin: 4px 0;
}

.grid_box{
    background-color: var(--bg-light);
    padding: 30px;
}
</style>
