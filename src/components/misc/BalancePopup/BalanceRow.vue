<template>
    <div class="bal_row">
        <p class="symbol">{{asset.symbol}}</p>
        <p class="name">{{asset.name}}</p>
        <p class="amt">{{asset.toString()}}</p>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import AvaAsset from "@/js/AvaAsset";
    import * as BN from 'bn.js';
    import Big from "big.js";

    @Component
    export default class BalanceRow extends Vue{
        @Prop() asset!: AvaAsset
    }
</script>
<style scoped lang="scss">
    @use '../../../main';


    .symbol{
        background-color: #eee;
        border-radius: 6px;
        padding: 2px 6px;
        font-size: 11px;
        align-self: center;
        text-align: center;

    }

    .name{
        overflow: auto;
        text-overflow: ellipsis;
        align-self: center;
        white-space: nowrap;
        text-align: left;
    }

    .amt{
        text-align: right;
    }

    @include main.mobile-device {

    }
</style>
