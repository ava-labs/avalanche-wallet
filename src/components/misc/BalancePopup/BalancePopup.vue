<template>
    <div class="balance_popup">
        <div class="bal_row" v-for="asset in assets" :key="asset.id" :zero="asset.amount.isZero()" @click="select(asset)">
            <p class="symbol">{{asset.symbol}}</p>
            <p class="name">{{asset.name}}</p>
            <p class="amt">{{asset.amount.toString()}}</p>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import AvaAsset from "@/js/AvaAsset";


    @Component
    export default class BalancePopup extends Vue{
        @Prop() assets!: AvaAsset[];

        select(asset: AvaAsset){
            this.$emit('select', asset);
        }
    }
</script>
<style scoped lang="scss">
    .balance_popup{
        border: 1px solid #f2f2f2;
        box-shadow: 2px 0px 6px rgba(0,0,0,0.2);
        max-height: 340px;
        overflow: scroll;
    }

    .bal_row{
        padding: 6px 14px;
        width: 100%;
        overflow: auto;
        border-bottom: 1px solid #f2f2f2;
        display: grid;
        column-gap: 15px;
        grid-template-columns: 48px max-content 1fr;
        font-size: 0.8rem;
        transition-duration: 0.2s;
        cursor: pointer;
        user-select: none;

        &:hover {
             background-color: #fafafa;
        }


        &[zero]{
            opacity: 0.4;
        }
    }

    .symbol{
        background-color: #eee;
        border-radius: 6px;
        padding: 2px 6px;
        font-size: 12px;
        align-self: center;
        text-align: center;

    }

    .name{
        overflow: hidden;
        text-overflow: ellipsis;
        align-self: center;
    }

    .amt{
        text-align: right;
    }
</style>
