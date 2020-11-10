<template>
    <div class="utxo" :income="isIncome">
        <p class="action">{{actionText}}</p>
        <p class="amount" :style="{
            color: color
        }">{{amountText}} {{symbolText}}</p>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata'
    import { Vue, Component, Prop } from 'vue-property-decorator'

    import Big from 'big.js';
    import AvaAsset from "@/js/AvaAsset";

    @Component
    export default class TxHistoryValue extends Vue{
        @Prop() amount!: number|string;
        @Prop() assetId!: string;
        // @Prop() isIncome!: string;

        get asset(): AvaAsset | undefined{
            return this.$store.state.Assets.assetsDict[this.assetId];
        }
        get color():string{
            if(this.amount > 0){
                return "#6BC688"
            }else if(this.amount===0){
                return "#999";
            }else{
                return "#d04c4c"
            }
        }

        get isIncome(): boolean{
            if(this.amount > 0){
                return true;
            }
            return false;
        }
        get actionText(): string{
            if(this.isIncome){
                return 'Received';
            }
            return 'Sent';
        }
        get amountText(): string{
            let asset = this.asset;

            if(!asset) return this.amount.toString();

            let val = Big(this.amount).div(Math.pow(10,asset.denomination));
            return val.toString();
        }

        get symbolText(): string{
            let asset = this.asset;

            if(!asset) return this.assetId.substring(0,4);

            return  asset.symbol;
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    .utxo{
        display: grid;
        grid-template-columns: max-content 1fr;
        column-gap: 10px;
        /*color: #ff2626;*/

        &[income]{
            /*color: main.$green;*/
        }

        > *{
            align-self: center;
        }
    }

    .action{
        font-size: 12px;
        color: main.$primary-color-light;
    }
    .amount{
        text-align: right;
        white-space: nowrap;
        font-size: 15px;
    }

    .name{

    }

    @include main.medium-device {
        .utxo{
            /*grid-template-columns: none;*/
            /*text-align: right;*/
        }
        .amount{
            font-size: 14px;
        }
    }
</style>
