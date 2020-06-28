<template>
    <div class="balance_popup" v-if="isActive">
        <div class="bg" @click="closePopup"></div>
        <div class="popup_body">
            <p class="desc">Select an asset</p>
            <div class="rows">
                <BalanceRow class="bal_row" v-for="asset in assets" :key="asset.id" :zero="asset.amount.isZero()" @click.native="select(asset)" :disabled="isDisabled(asset)" :asset="asset"></BalanceRow>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import AvaAsset from "@/js/AvaAsset";
    import BalanceRow from './BalanceRow.vue';

    @Component({
        components: {
            BalanceRow
        }
    })
    export default class BalancePopup extends Vue{
        @Prop() assets!: AvaAsset[];
        @Prop({default: () => []}) disabledIds!: string[];


        isActive: boolean = false;


        select(asset: AvaAsset){
            if(asset.amount.isZero()) return;
            if(this.isDisabled(asset)) return;

            this.$emit('select', asset);
        }

        isDisabled(asset:AvaAsset): boolean{
            if(this.disabledIds.includes(asset.id)) return true;
            return false;
        }


        closePopup(){
            this.isActive = false;
        }



    }
</script>
<style scoped lang="scss">
    .bg{
        position: fixed;
        z-index: 2;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .desc{
        font-size: 0.8rem;
        padding: 3px 15px;
        background-color: #1f1f1f;
        color: #fff;
    }

    .balance_popup{
        position: relative;
        text-align: left;
    }

    .popup_body{
        position: relative;
        border: 1px solid #f2f2f2;
        box-shadow: 2px 0px 6px rgba(0,0,0,0.2);
        max-height: 340px;
        height: 340px;
        min-width: 280px;
        display: grid;
        grid-template-rows: max-content 1fr;
        overflow: auto;
        z-index: 3;
        background-color: #fff;
    }

    .rows{
        overflow: scroll;
    }

    .bal_row{
        padding: 6px 14px;
        width: 100%;
        overflow: auto;
        border-bottom: 1px solid #f2f2f2;
        display: grid;
        column-gap: 15px;
        grid-template-columns: 48px 1fr max-content;
        font-size: 0.8rem;
        transition-duration: 0.2s;
        cursor: pointer;
        user-select: none;

        &:hover {
             background-color: #fafafa;
        }
    }

    .bal_row[zero]{
        cursor: default;
        opacity: 0.4;
        &:hover {
            background-color: inherit;
        }
    }

    .bal_row[disabled]{
        text-decoration: line-through;
    }


</style>
