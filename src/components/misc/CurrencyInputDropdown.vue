<template>
    <div>
        <div class="curr_in_drop">
            <button class="max_but" @click="maxOut">MAX</button>
            <input type="number" placeholder="0.00" @input="amount_in" ref="amount" v-model="amount">
            <dropdown :items="dropdown_values" class="dropdown" @change="drop_change" :initial="initial"></dropdown>
        </div>
        <div class="bar"><div :style="{
            width: percFull+'%'
        }"></div></div>
    </div>
</template>
<script>
    import Dropdown from "@/components/misc/Dropdown";
    export default {
        components: {
            Dropdown
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
            percFull(){
                return (this.amount/this.max_amount)*100;
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
                if(this.assets) return this.assets;
                return this.global_assets;
            },
            global_assets(){
                return this.$store.getters.balance;
            },
            max_amount(){
                if(!this.asset_now) return 0;
                return this.asset_now.balance;
            },
            isEmpty(){
                if(this.dropdown_values.length===0){
                    return true;
                }else{
                    return false;
                }
            }
        },
        methods: {
            maxOut(){
                this.amount = this.max_amount;
                this.onchange();
            },
            amount_in(){
                let amount = parseFloat(this.$refs.amount.value);
                if(amount > this.max_amount){
                    amount = this.max_amount;
                    this.amount = amount;
                }
                this.onchange();
            },

            drop_change(val){
                this.asset_now = val;
                this.amount_in();
            },

            // onchange event for the Component
            onchange(){
                this.$emit('change',{
                    asset: this.asset_now,
                    amount: parseFloat(this.amount)
                });
            }
        },
        mounted(){
            if(this.isEmpty) return;
            if(this.initial){
                for(var i=0;i<this.dropdown_values.length;i++){
                    let val = this.dropdown_values[i];
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