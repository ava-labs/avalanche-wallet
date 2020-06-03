<template>
    <div>
        <div class="curr_in_drop">
            <div class="max_in_cont">
                <button class="max_but" @click="maxOut">MAX</button>
                <big-num-input ref="bigIn" @change="amount_in" class="bigIn" contenteditable="bigIn" :max="max_amount" :denomination="denomination"></big-num-input>
            </div>
            <dropdown :items="dropdown_values" class="dropdown" @change="drop_change" :initial="initial"></dropdown>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import * as BN from 'bn.js';
    import Big from 'big.js';
    import Dropdown from "@/components/misc/Dropdown.vue";
    // import BigNumInput from "@/components/misc/BigNumInput";

    // @ts-ignore
    import { BigNumInput } from '@avalabs/vue_components';
    import AvaAsset from "@/js/AvaAsset";

    interface IDropdownValue {
        label: string,
        key: string,
        data: any,
        disabled: boolean
    }

    @Component({
        components: {
            Dropdown,
            BigNumInput
        }
    })
    export default class CurrencyInputDropdown extends Vue{
        amount: Big = new Big(0);
        asset_now: AvaAsset|null = null;

        @Prop({default: () => []}) disabled_assets!: AvaAsset[];
        @Prop({default: ''}) initial!: string;

        mounted(){
            if(this.isEmpty) return;
            if(this.initial){
                for(var i=0;i<this.dropdown_values.length;i++){
                    let val = this.dropdown_values[i];
                    if(val.key === this.initial){
                        this.drop_change(val.data);
                    }
                }
            }else{
                this.drop_change(this.dropdown_values[0].data);
            }
        }


        maxOut(){
            // @ts-ignore
            this.$refs.bigIn.maxout();
        }

        amount_in(val: Big){
            this.amount = val;
            this.onchange();
        }


        drop_change(val: AvaAsset){
            this.asset_now = val;
            this.amount_in(Big(0));
        }


        // onchange event for the Component
        onchange(){
            this.$emit('change',{
                asset: this.asset_now,
                amount: this.amount
            });
        }




        get isEmpty():boolean{
            if(this.dropdown_values.length===0){
                return true;
            }else{
                return false;
            }
        }

        get display():string{
            return '';
        }

        get placeholder():string{
            if(this.isEmpty || !this.asset_now) return '0.00';
            let deno = this.asset_now.denomination;
            let res = '0';
            if(deno > 0){
                res += '.';
                for(var i=0;i<deno;i++){
                    res += '0';
                }
            }
            return res;
        }

        get denomination(): number{
            if(!this.asset_now) return 0;
            return this.asset_now.denomination;
        }


        get dropdown_values(){
            let res: IDropdownValue[] = [];

            this.dropdown_assets.forEach(asset => {
                let disabled= false;
                if(this.disabled_assets.includes(asset)){
                    disabled = true;
                }
                res.push({
                    label: `${asset.name} (${asset.symbol})`,
                    key: asset.id,
                    data: asset,
                    disabled: disabled
                });
            });
            return res;
        }

        get dropdown_assets():AvaAsset[]{
            // if(this.assets) return this.assets;
            return this.global_assets;
        }

        get global_assets():AvaAsset[]{
            return this.$store.state.Assets.assets;
        }

        get max_amount(): null | BN{
            if(!this.asset_now) return null;
            if(this.asset_now.amount.isZero()) return null;
            return this.asset_now.amount;
        }
    }

    // export default {
    //     components: {
    //         Dropdown,
    //         BigNumInput
    //     },
    //     data(){
    //         return {
    //             amount: null,
    //             asset_now: null,
    //         }
    //     },
    //     props: {
    //         disabled_assets: {
    //             type: Array,
    //             default: function(){
    //                 return [];
    //             },
    //         },
    //         initial: String,
    //     },
    //     computed: {
    //         isEmpty(){
    //             if(this.dropdown_values.length===0){
    //                 return true;
    //             }else{
    //                 return false;
    //             }
    //         },
    //         display(){
    //             return '';
    //         },
    //         placeholder(){
    //             if(this.isEmpty || !this.asset_now) return '0.00';
    //             let deno = this.asset_now.denomination;
    //             let res = '0';
    //             if(deno > 0){
    //                 res += '.';
    //                 for(var i=0;i<deno;i++){
    //                     res += '0';
    //                 }
    //             }
    //             return res;
    //         },
    //         percFull(){
    //             if(!this.amount || !this.max_amount) return 0;
    //             let max = this.max_amount;
    //
    //             // console.log(max.toString())
    //             return (this.amount.div(max))*100;
    //         },
    //
    //         denomination(){
    //             if(!this.asset_now) return 0;
    //             return this.asset_now.denomination;
    //         },
    //
    //         dropdown_values(){
    //             let res = [];
    //
    //
    //             this.dropdown_assets.forEach(asset => {
    //                 let disabled= false;
    //                 if(this.disabled_assets.includes(asset)){
    //                     disabled = true;
    //                 }
    //                 res.push({
    //                     label: `${asset.name} (${asset.symbol})`,
    //                     key: asset.id,
    //                     data: asset,
    //                     disabled: disabled
    //                 });
    //             });
    //             // for(var id in this.dropdown_assets){
    //             //     let asset = this.dropdown_assets[id];
    //             //     let disabled= false;
    //             //     if(this.disabled_assets.includes(asset)){
    //             //         disabled = true;
    //             //     }
    //             //     res.push({
    //             //         label: asset.name,
    //             //         data: asset,
    //             //         disabled: disabled
    //             //     });
    //             // }
    //
    //             return res;
    //         },
    //         dropdown_assets(){
    //             // if(this.assets) return this.assets;
    //             return this.global_assets;
    //         },
    //         global_assets(){
    //             return this.$store.state.Assets.assets;
    //         },
    //         max_amount(){
    //
    //             if(!this.asset_now) return null;
    //             if(this.asset_now.amount.isZero()) return null;
    //             // console.log(typeof this.asset_now.amount.clone());
    //             return this.asset_now.amount;
    //         }
    //     },
    //     methods: {
    //         maxOut(){
    //             this.$refs.bigIn.maxout();
    //             // this.amount = this.max_amount;
    //
    //             // this.onchange();
    //         },
    //         amount_in(val){
    //             this.amount = val;
    //             this.onchange();
    //         },
    //
    //         drop_change(val){
    //             this.asset_now = val;
    //             this.amount_in(Big(0));
    //         },
    //
    //         // onchange event for the Component
    //         onchange(){
    //             this.$emit('change',{
    //                 asset: this.asset_now,
    //                 amount: this.amount
    //             });
    //         }
    //     },
    //     created(){
    //         this.amount = new Big(0,10);
    //     },
    //     mounted(){
    //         if(this.isEmpty) return;
    //         if(this.initial){
    //             for(var i=0;i<this.dropdown_values.length;i++){
    //                 let val = this.dropdown_values[i];
    //                 if(val.key === this.initial){
    //                     this.drop_change(val.data);
    //                 }
    //             }
    //         }else{
    //             this.drop_change(this.dropdown_values[0].data);
    //         }
    //     },
    // }
</script>
<style scoped lang="scss">
    $barH: 1px;

    .bigIn{
        width: 100%;
        /*background-color: #303030;*/
    }

    .max_in_cont{
        display: grid;
        grid-template-columns: 50px 1fr;
    }


    .curr_in_drop{
        display: grid;
        grid-template-columns: 1fr 140px;
        background-color: transparent;
        /*height: 35px;*/
        /*font-size: 12px;*/
        /*border: 1px solid #ddd;*/
        font-size: 12px;
        height: 40px;
        width: 100%;
        outline: none;
        text-align: right;
        column-gap: 10px;

        > *{
            background-color: #F5F6FA;
            border-radius: 2px;
        }
    }


    input{
        padding: 8px;
        flex-grow: 1;
        outline: none;
        text-align: right;
        flex-basis: 0px;
        width: 0px;
    }

    .max_but{
        font-size: 12px;
        text-decoration: underline;
        text-decoration-style: dashed;
        outline: none;
        padding-left: 8px;
    }

    .dropdown{
        /*flex-basis: 140px;*/
        width: 100%;
        /*border-left: 1px solid #d2d2d2;*/
    }
</style>
