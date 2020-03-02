<template>
    <div>
        <div class="curr_in_drop">
            <button class="max_but" @click="maxOut">MAX</button>
            <big-num-input ref="bigIn" @change="amount_in" class="bigIn" contenteditable="bigIn" :max="max_amount" :denomination="denomination"></big-num-input>
            <dropdown :items="dropdown_values" class="dropdown" @change="drop_change" :initial="initial"></dropdown>
        </div>
        <div class="bar"><div :style="{
            width: percFull+'%'
        }"></div></div>
    </div>
</template>
<script>
    import * as BN from 'bn.js';
    import Big from 'big.js';
    import Dropdown from "@/components/misc/Dropdown";
    // import BigNumInput from "@/components/misc/BigNumInput";

    import { BigNumInput } from '@avalabs/vue_components';

    export default {
        components: {
            Dropdown,
            BigNumInput
        },
        data(){
            return {
                amount: null,
                asset_now: null,
            }
        },
        props: {
            disabled_assets: {
                type: Array,
                default: function(){
                    return [];
                },
            },
            initial: Object,
        },
        computed: {
            isEmpty(){
                if(this.dropdown_values.length===0){
                    return true;
                }else{
                    return false;
                }
            },
            display(){
                return '';
            },
            placeholder(){
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
            },
            percFull(){
                if(!this.amount || !this.max_amount) return 0;
                let max = this.max_amount;
                return (this.amount.div(max))*100;
            },

            denomination(){
                if(!this.asset_now) return 0;
                return this.asset_now.denomination;
            },

            dropdown_values(){
                let res = [];

                for(var id in this.dropdown_assets){
                    let asset = this.dropdown_assets[id];
                    let disabled= false;
                    if(this.disabled_assets.includes(asset)){
                        disabled = true;
                    }
                    res.push({
                        label: asset.name,
                        data: asset,
                        disabled: disabled
                    });
                }

                return res;
            },
            dropdown_assets(){
                // if(this.assets) return this.assets;
                return this.global_assets;
            },
            global_assets(){
                return this.$store.getters['Assets/assetsArray'];
            },
            max_amount(){
                if(!this.asset_now) return null;
                // console.log(typeof this.asset_now.amount.clone());
                return this.asset_now.amount;
            }
        },
        methods: {
            maxOut(){
                this.$refs.bigIn.maxout();
                // this.amount = this.max_amount;

                // this.onchange();
            },
            amount_in(val){
                // console.log(val.toString());
                // let amount = parseFloat(this.$refs.amount.value);
                // if(amount > this.max_amount){
                //     amount = this.max_amount;
                //     this.amount = amount;
                // }
                this.amount = val;
                this.onchange();
            },

            drop_change(val){
                this.asset_now = val;
                this.amount_in(Big(0));
            },

            // onchange event for the Component
            onchange(){
                this.$emit('change',{
                    asset: this.asset_now,
                    amount: this.amount
                });
            }
        },
        created(){
            this.amount = new Big(0,10);
        },
        mounted(){
            if(this.isEmpty) return;
            if(this.initial){
                for(var i=0;i<this.dropdown_values.length;i++){
                    let val = this.dropdown_values[i];
                    // console.log(val);
                    if(val.data === this.initial){
                        this.drop_change(val.data);
                    }
                }
            }else{
                this.drop_change(this.dropdown_values[0].data);
            }
        },
    }
</script>
<style scoped lang="scss">
    $barH: 2px;

    .bigIn{
        width: 100%;
        /*background-color: #303030;*/
    }
    .curr_in_drop{
        display: flex;
        background-color: #f8f8f8;
        padding: 0px 8px;
        height: 48px;
        width: 100%;
        outline: none;
        text-align: right;
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
    }

    .dropdown{
        flex-basis: 140px;
        border-left: 1px solid #d2d2d2;
    }

    .bar{
        height: $barH;
        background-color: #d2d2d2;
        position: relative;
    }

    .bar div{
        position: absolute;
        top: 0;
        left: 0;
        width: 0%;
        background-color: #6bc79d;
        height: $barH;
        transition-duration: 1s;
    }
</style>