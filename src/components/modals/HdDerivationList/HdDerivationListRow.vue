<template>
    <div class="list_row">
        <p style="text-align: center;">{{index}}</p>
        <p class="col_addr">{{address}}</p>
        <div class="col_bal">
            <p v-for="(bal, assetId) in cleanBalance" :key="assetId">
                {{bal.toLocaleString(assetsDict[assetId].denomination)}}
                <span>{{assetsDict[assetId].symbol}}</span>
            </p>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import Big from "big.js";
    import {DerivationListBalanceDict} from "@/components/modals/HdDerivationList/types";

    @Component


    export default class HdDerivationListRow extends Vue{
        @Prop() index!: number;
        @Prop() address!: string;
        @Prop() balance!:DerivationListBalanceDict;


        get cleanBalance(): DerivationListBalanceDict{
            let res:DerivationListBalanceDict = {};
            for(var bal in this.balance){
                let balance:Big = this.balance[bal];
                if(balance.gt(Big(0))){
                    res[bal] = balance;
                }
            }
            return res;
        }

        get assetsDict(){
            return this.$store.state.Assets.assetsDict;
        }

    }
</script>
<style scoped lang="scss">
    .col_addr{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .col_bal{
        text-align: right;
        padding-right: 15px;
    }

    span{
        /*background-color: #ddd;*/
        /*padding: 2px 6px;*/
        border-radius: 2px;
        font-weight: bold;
    }
</style>
