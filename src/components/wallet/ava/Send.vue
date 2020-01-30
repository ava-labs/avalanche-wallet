<template>
    <div>
        <h3>Send</h3>
        <div class="send_body">
            <div>
                <label>Asset:</label>
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn color="accent" dark v-on="on" block :height="30" depressed>
                            {{dropdown_title}}
                        </v-btn>
                    </template>
                    <v-list :dense="true">
                        <v-list-item v-for="(asset) in assets" :key="asset.id" @click="select(asset)" :ripple="false" :dense="true">
                            <v-list-item-title>{{ asset.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <label>Amount:</label>
                <currency-input class='amount_in' v-model="amountIn" :currency="currency_title" :max-val="currency_max"></currency-input>
<!--                <input class='amount_in' type="number" placeholder="0.00" v-model="amountIn">-->
                <v-btn color="accent" @click="addToOrder(selected, amountIn)" block :height="30" depressed>Add to order</v-btn>
            </div>
            <hr>
            <div>
                <p v-if="orders.length===0">No orders given to send</p>
                <div v-else class="order_list">
                    <div v-for="order in orders" :key="order.asset.key">
                        <p>{{order.asset.title}}</p>
                        <span>{{order.amount}}</span>
                        <button @click="removeOrder(order)">X</button>
                    </div>
                </div>
            </div>
            <hr>
            <div>
                <label>Send to</label>
                <v-text-field placeholder="Enter destination address"></v-text-field>
                <v-btn block color="primary">Send</v-btn>
            </div>
        </div>

    </div>
</template>
<script>
    import CurrencyInput from "@/components/misc/CurrencyInput";

    export default {
        components: {
            CurrencyInput,
        },
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
                this.amountIn = 0;
            },
            addToOrder(asset, amount){
                if(asset===null || amount <= 0){
                    return;
                }
                // Check if asset already exists
                for(var i=0; i<this.orders.length; i++){
                    let order = this.orders[i];
                    if(order.asset === asset){
                        console.log(order);
                        order.amount += parseFloat(amount);
                        if(order.amount > asset.balance){
                            order.amount = asset.balance;
                        }
                        return;
                    }
                }

                this.orders.push({
                    asset: asset,
                    amount: parseFloat(amount)
                });
            },
            removeOrder(order){
                for(var i=0; i<this.orders.length; i++){
                    if(this.orders[i] === order){
                        this.orders.splice(i,1);
                        return;
                    }
                }
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
            currency_title(){
                if(!this.selected) return '-';
                return this.selected.key;
            },
            currency_max(){
                if(!this.selected) return 0;
                return this.selected.balance;
            }
        }

    }
</script>
<style scoped>
    label{
        width: 100%;
        display: block;
        text-align: left;
        font-weight: bold;
        font-size: 12px;
    }

    hr{
        margin: 15px 0px;
        opacity: 0.4;
    }

    .amount_in{
        width: 100%;
        border: 1px solid #d2d2d2;
        margin-bottom: 5px;
        height: 40px;
    }

    .send_body{
        padding: 12px;
    }

    .order_list div{
        display: flex;
        padding: 2px 12px;
        text-align: left;
        margin: 0 !important;
        font-size: 12px;
    }

    .order_list p{
        margin: 0 !important;
        flex-grow: 1;
    }
    .order_list button{

        /*float: right;*/
    }
    .order_list span{
        /*float: right;*/
    }
</style>