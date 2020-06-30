<template>
    <div class="access_view">
        <create-wallet></create-wallet>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

import CreateWallet from "@/components/CreateWalletWorkflow/CreateWallet.vue";
@Component({
    components: {
        CreateWallet
    }
})
export default class Create extends Vue {}
</script>
<style scoped lang="scss">
@use '../main';

.access_view {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: main.$white;
}

.card {
    text-align: center;
}

.generate {
    display: block;
    margin: 30px auto;
    background-color: #000;
    padding: 8px 18px;
    border-radius: 6px;
    color: #fff !important;
}

.key_disp {
    margin: 30px auto;
    font-size: 12px;
}

a {
    color: #1d82bb !important;
}
</style>
