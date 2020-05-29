<template>
    <div class="utxo" :income="isIncome">
        <p class="action">{{actionText}}</p>
        <p class="amount">{{amountText}} {{asset.symbol}}</p>
    </div>
</template>
<script>
    import Big from 'big.js';

    export  default {
        props: {
            amount:{
                type: [Number, String],
                required: true
            },
            assetId: {
                type: String,
                required: true,
            }
        },
        computed:{
            asset(){
                return this.$store.state.Assets.assetsDict[this.assetId];
            },
            isIncome(){
                if(this.amount > 0){
                    return true;
                }
                return false;
            },
            actionText(){
                if(this.isIncome){
                    return 'Received';
                }
                return 'Sent';
            },
            amountText(){
                let asset = this.asset;
                let val = Big(this.amount).div(Math.pow(10,asset.denomination));
                return val.toFixed(asset.denomination);
            }
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    .utxo{
        display: grid;
        grid-template-columns: max-content 1fr;
        column-gap: 10px;

        &[income]{
            color: #5ECB08;
        }

        > *{
            align-self: center;
        }
    }

    .action{
        font-size: 12px;
        color: #909090;
    }
    .amount{
        text-align: right;
        white-space: nowrap;
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
