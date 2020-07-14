<template>
    <div>
        <div class="table_title">
            <p>Amount</p>
            <p>Type</p>
        </div>
        <div v-for="(tx, i) in tx_list" :key="tx.uuid" class="list_item">
            <currency-input-dropdown
                    class="list_in"
                    @change="oninputchange(i,$event)"
                    :disabled_assets="disabledAssets[i]"
                    :initial="tx.asset.id"
            ></currency-input-dropdown>
            <button @click="removeTx(i)" v-if="i !== 0 || tx_list.length>1">Remove Asset</button>
        </div>
        <button block depressed @click="addTx()" class="add_asset" v-if="showAdd"> <fa icon="plus"></fa> Add Asset</button>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';


    const uuidv1 = require('uuid/v1');

    import Big from 'big.js';
    import CurrencyInputDropdown from "@/components/misc/CurrencyInputDropdown.vue";
    import AvaAsset from "@/js/AvaAsset";
    import {AssetsDict} from "@/store/modules/assets/types";
    import {ICurrencyInputDropdownValue, ITransaction} from "@/components/wallet/transfer/types";

    @Component({
        components: {
            CurrencyInputDropdown
        }
    })
    export default class TxList extends Vue{
        tx_list: ITransaction[] = [];
        disabledAssets: AvaAsset[][] = [];
        next_initial: AvaAsset|null = null;

        updateUnavailable(): void{
            let res:AvaAsset[][] = [];
            let allDisabled = [];

            for(var i=0; i<this.tx_list.length; i++){
                let localDisabled:AvaAsset[] = [];

                allDisabled.push(this.tx_list[i].asset);
                for(var n=0; n<this.tx_list.length; n++){
                    if(i===n) continue;
                    let assetNow = this.tx_list[n].asset;
                    localDisabled.push(assetNow);
                }
                res.push(localDisabled);
            }

            this.next_initial = null;
            for(i=0; i<this.assets_list.length;i++){
                let asset = this.assets_list[i];
                if(!allDisabled.includes(asset)){
                    this.next_initial = asset;
                    break;
                }
            }

            this.disabledAssets = res;
        }

        oninputchange(index:number, event:ICurrencyInputDropdownValue):void {

            let asset = event.asset;
            let amt = event.amount;

            if(!asset) return;

            this.tx_list[index].asset = asset;
            this.tx_list[index].amount = amt;

            this.updateUnavailable();

            this.$emit('change', this.tx_list);
        }

        removeTx(index:number): void{
            if(this.tx_list.length===1) return;
            this.tx_list.splice(index,1);
            this.updateUnavailable();
            this.$emit('change', this.tx_list);
        }

        addTx(id?:string): void{
            if(this.tx_list.length >= this.assets_list.length){
                return;
            }

            let uuid = uuidv1();

            if(id){
                this.tx_list.push({
                    uuid: uuid,
                    asset: this.assets[id],
                    amount: Big(0),
                });
            }else if(this.next_initial){
                this.tx_list.push({
                    uuid: uuid,
                    asset: this.next_initial,
                    amount: Big(0),
                });
            }
            this.$emit('change', this.tx_list);
        }

        // clears the list and leaves 1 empty order
        clear(): void{
            for(var i=this.tx_list.length-1;i>=1;i--){
                this.removeTx(i);
            }
        }


        mounted() {
            this.next_initial = this.assets_list[0];
            if(this.$route.query.asset){
                let assetId = this.$route.query.asset as string;
                this.addTx(assetId);
            }else{
                this.addTx();
            }
        }

        get assets_list(): AvaAsset[]{
            return this.$store.getters.walletAssetsArray;
        }
        get assets(): AssetsDict{
            return this.$store.getters.walletAssetsDict;
        }
        get showAdd(): boolean{
            if(this.tx_list.length === this.assets_list.length || this.assets_list.length===0){
                return false;
            }
            return true;
        }
    }
</script>
<style scoped lang="scss">
@use '../../../main';

    .table_title{
        display: grid;
        grid-template-columns: 1fr 140px;
    }
    .table_title p{
        margin: 0;
        font-weight: bold;
        font-size: 12px;
        text-align: left;
    }
    .table_title p:first-of-type{
        flex-grow: 1;
    }


    .list_item{
        position: relative;
        display: flex;
        flex-direction: column;
        margin-bottom: 4px;
        padding: 2px 0px;
        border-radius: 3px !important;


        &:last-of-type{
            margin-bottom: 0px;
        }
    }

    .list_in{
        flex-grow: 1;
    }

    .list_item button{
        width: max-content;
        text-align: right;
        align-self: flex-end;
        text-align: right;
        font-size: 12px;
        color: main.$primary-color-light;
        margin-top: 6px;
        margin-bottom: 10px;
        
        &:hover{
            opacity: 0.7;
        }
    }





    .add_asset{
        margin-top: 16px;
        border-radius: 0;
        color: main.$primary-color;
        font-size: 14px;

        &:hover{
            opacity: 0.7;
        }
    }


    /*.list_item:before{*/
    /*    content: '';*/
    /*    position: absolute;*/
    /*    height: 100%;*/
    /*    width: 11px;*/
    /*    border-right: 1px dashed #d2d2d2;*/
    /*    opacity: 0.4;*/
    /*}*/

    .list_item[empty] button{
        opacity: 0.8;
    }
    .list_item[empty] .list_in, .list_item[empty]:before{
        opacity: 0.1;
        transition-duration: 0.2s;
    }
    .list_item[empty] button:hover{
        opacity: 1;
    }
    .list_item[empty] .list_in{
        pointer-events: none;
    }
 </style>
