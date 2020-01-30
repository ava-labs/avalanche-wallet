<template>
    <div>
        <div class="curr_in_drop">
            <button class="max_but" @click="maxOut">MAX</button>
            <input type="number" placeholder="0.00" @input="amount_in" ref="amount" v-model="amount">
            <dropdown :items="dropdown_values" class="dropdown" @change="drop_change"></dropdown>
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
            assets: {
                type: Array,
                default: null,
            }
        },
        computed: {
            percFull(){
                return (this.amount/this.max_amount)*100;
            },
            dropdown_values(){
                let res = [];
                for(var i in this.dropdown_assets){
                    let asset = this.dropdown_assets[i];
                    res.push({
                        label: asset.title,
                        data: asset,
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
            this.drop_change(this.dropdown_values[0].data);
        },
    }
</script>
<style scoped>


    .curr_in_drop{
        display: flex;
        background-color: #404040;
        padding: 0px 8px;
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
        border-left: 1px solid #505050;
    }

    .bar{
        height: 1px;
        background-color: #7d7d7d;
        position: relative;
    }

    .bar div{
        position: absolute;
        top: 0;
        left: 0;
        width: 0%;
        background-color: #fff;
        height: 1px;
        transition-duration: 1s;
    }
</style>