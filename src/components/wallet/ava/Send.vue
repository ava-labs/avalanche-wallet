<template>
    <div>
        <h3>Send</h3>
        <div>
            <b-form-group>
                <label>Asset</label>
                <b-dropdown id="dropdown-1" :text="dropdown_title" class="m-md-2" >
                    <b-dropdown-item v-for="asset in assets" :key="asset.key" @click="select(asset)">{{asset.title}}</b-dropdown-item>
                </b-dropdown>
            </b-form-group>
            <b-form-group>
                <input type="number" placeholder="Amount" v-model="amountIn">
            </b-form-group>
            <b-form-group>
                <button class="btn-secondary" @click="addToOrder(selected, amountIn)">Add to order</button>
            </b-form-group>
        </div>
        <hr>
        <div>
            <p v-if="orders.length===0">No orders given to send</p>
            <div v-else class="order_list">
                <p v-for="order in orders" :key="order.asset.key">
                    {{order.asset.title}}
                    <span>{{order.amount}}</span>
                </p>
            </div>
        </div>
        <hr>
        <div>
            <b-form-group>
                <label>Send to</label>
                <input type="text">
                <button class="btn-primary">Send</button>
            </b-form-group>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                orders: [],
                amountIn: 0,
                selected: null,
            }
        },
        methods: {
            select(asset){
                this.selected = asset;
            },
            addToOrder(asset, amount){
                this.orders.push({
                    asset: asset,
                    amount: amount
                });
            }
        },
        props:{
            assets: Array
        },
        computed:{
            dropdown_title(){
                if(!this.selected) return 'Select an asset';
                else{
                    return this.selected.title;
                }
            },
        }

    }
</script>
<style>
    label{
        display: block;
    }
    .order_list p{
        padding: 2px 12px;
        text-align: left;
        margin: 0;
        font-size: 12px;
    }
    .order_list p span{
        float: right;
    }
</style>