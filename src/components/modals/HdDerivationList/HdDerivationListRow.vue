<template>
    <div class="list_row">
        <p style="text-align: center;">{{index}}</p>
        <p class="col_addr">{{keyPair.getAddressString()}}</p>
        <div class="col_bal">
            <p v-for="(bal, assetId) in balance" :key="assetId">
                {{bal.toLocaleString(assetsDict[assetId].denomination)}}
                <span>{{assetsDict[assetId].symbol}}</span>
            </p>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import {AVMKeyPair} from "avalanche/typings/src/apis/avm";
    import Big from "big.js";

    @Component
    export default class HdDerivationListRow extends Vue{
        @Prop() index!: number;
        @Prop() keyPair!:AVMKeyPair;
        @Prop() balance!:{[key:string]: Big};


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
