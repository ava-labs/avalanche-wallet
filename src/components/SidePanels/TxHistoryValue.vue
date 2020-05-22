<template>
    <div class="utxo" :income="isIncome">
        <p class="amount">{{amountText}} </p>
        <p class="name">{{asset.symbol}}</p>
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
            amountText(){
                let asset = this.asset;
                let val = Big(this.amount).div(Math.pow(10,asset.denomination));
                return val.toFixed(asset.denomination);
            }
        }
    }
</script>
<style scoped lang="scss">
    .utxo{
        display: grid;
        grid-template-columns: max-content 50px;
        column-gap: 10px;

        &[income]{
            color: #5ECB08;
        }

    }

    .amount{

    }

    .name{

    }

</style>
