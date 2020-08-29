<template>
    <div>
        <p v-if="isCollectibleEmpty && isFungibleEmpty">
            Empty
        </p>
        <template v-else>
            <div>
                <p v-for="order in cleanOrders" :key="order.uuid">
                    {{order.asset.symbol}}
                    <span class="amt">
                    {{cleanNum(order.amount, order.asset.denomination)}}
                    </span>
                </p>
            </div>
            <div class="nfts">
                <NftCard v-for="order in nftOrders" :utxo="order" :mini="true" :key="order.id"></NftCard>
            </div>
        </template>


    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Ref, Prop} from 'vue-property-decorator';
    import {ITransaction} from "./types";
    import {UTXO} from "avalanche/dist/apis/avm";
    import Big from "big.js";
    import BN from "bn.js";
    import NftCard from "@/components/wallet/portfolio/NftCard.vue";

    @Component({
        components: {
            NftCard
        }
    })
    export default class TxSummary extends Vue{
        @Prop() orders!: ITransaction[];
        @Prop() nftOrders!: UTXO[];

        cleanNum(val: BN, denom: number){
            let bigVal = Big(val.toString()).div(Math.pow(10,denom))
            return bigVal.toLocaleString(denom)
        }

        get isFungibleEmpty(){
            for(var i=0; i<this.orders.length; i++){
                let order = this.orders[i];
                if(order.amount.gt(new BN(0))){
                    return false;
                }
            }
            return true;
        }

        get cleanOrders(){
            const ZERO = new BN(0);
            return this.orders.filter(order => {
                return order.amount.gt(ZERO)
            })
        }

        get isCollectibleEmpty(){
            return this.nftOrders.length === 0;
        }
    }
</script>
<style scoped lang="scss">
    p{
        width: 100%;
        color: var(--primary-color-light);
        font-size: 13px;
        font-family: Helvetica, monospace;
    }
    .amt{
        float: right;
    }

    .nfts{
        display: grid;
        grid-template-columns: repeat(6, 1fr);

        > div{
            width: 40px;
            overflow: auto;
            border-radius: 3px;
            height: 40px;
            background-color: var(--bg-light);
        }
    }
</style>