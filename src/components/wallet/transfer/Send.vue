<template>
    <div>
        <h4><fa icon="sign-out-alt"></fa><br>Send</h4>
        <div class="order_form">
            <div class="order_col form_col">
                <label>Select an asset to transfer</label>
                <div class="asset_select">
                    <button v-for="asset in assets" :key="asset.key" @click="select(asset)" :active="selected===asset">
                        {{asset.title}}
                        <br>
                        <span>
                            {{asset.balance}}
                        </span>
                    </button>
                </div>
                <label>Amount</label>
                <currency-input class='amount_in' :currency="currency_title" :max-val="currency_max" v-model="amountIn"></currency-input>
                <v-btn class="addBut" block color="#ddd" depressed @click="addToOrder(selected, amountIn)" >Add to transaction</v-btn>
            </div>
            <div class="order_col list_col">
                <label>Transaction List</label>
                <div class="list_cont">
                    <p v-if="orders.length===0">No transactions given to send</p>
                    <div v-else class="order_list">
                        <div v-for="order in orders" :key="order.asset.key">
                            <p>{{order.asset.title}}</p>
                            <span>{{order.amount}}</span>
                            <button @click="removeOrder(order)"><fa icon="times-circle"></fa></button>
                        </div>
                    </div>
                </div>
                <div class="checkout">

                    <label>Send to:</label>
                    <q-r-reader class="readerBut" @change="onQrRead">
                        <button><fa icon="camera"></fa></button>
                    </q-r-reader>
<!--                    <div class="sendToInputs">-->

                        <v-text-field v-model="addressIn" class="addressIn" color="#d88383" placeholder="####" height="40" background-color="#404040" dense flat :loading="isAjax" hide-details></v-text-field>
<!--                    </div>-->
                    <v-btn block color="#d88383" :loading="isAjax" :ripple="false" @click="send">Send</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import CurrencyInput from "@/components/misc/CurrencyInput";
    import QRReader from '@/components/misc/QRReader';
    import router from "@/router";

    export default {
        components: {
            CurrencyInput,
            QRReader
        },
        data(){
            return{
                isAjax: false,
                selected: null,
                amountIn: 0,
                addressIn: '',
                orders: [],
            }
        },
        mounted(){
            if(this.$route.query.asset){
                let key = this.$route.query.asset;
                console.log(key);
                for(var i=0;i<this.assets.length;i++){
                    let asset = this.assets[i];
                    if(asset.key === key){
                        this.select(asset);
                    }
                }
            }
        },
        methods: {
            onQrRead(value){
                this.addressIn = value;
            },
            select(asset){
                this.selected = asset;
                this.amountIn = null;
                const path = `/wallet/transfer?asset=${asset.key}`;
                if(this.$route.fullPath !== path){
                    router.push({ path: path});
                }
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
            },
            send(){
                let parent = this;
                this.isAjax = true;
                setTimeout(() => {
                    parent.isAjax = false;
                }, 1500);
            }
        },
        computed: {
            assets(){
                return this.$store.state.assets;
            },
            dropdown_items(){
                let res = [];
                for(var i=0; i<this.assets.length; i++){
                    res.push(this.assets[i].title);
                }
                return res;
            },
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
    .order_form{
        display: grid;
        grid-template-columns: 1fr 280px;
    }
    .asset_select{
        display: flex;
        flex-wrap: wrap;
        /*align-items: center;*/
        /*justify-content: center;*/
    }

    label{
        display: block;
        text-align: left;
        font-size: 14px;
        font-weight: bold;
        margin-top: 12px;
    }

    .form_col{
        display: flex;
        flex-direction: column;
    }
    .asset_select{
        flex-grow: 1;
    }
    .asset_select button{
        outline: none;
        transition-duration: 0.2s;
        border-radius: 2px;
        font-size: 13px;
        font-weight: bold;
        border: 1px solid #606060;
        margin: 5px;
        padding: 3px 10px;
        white-space: nowrap;
        height: min-content;
    }

    .asset_select button span{
        font-weight: normal;
    }

    .asset_select button[active]{
        color: #333;
        background-color: #d88383;
        border: 1px solid transparent;
    }

    .amount_in{
        background-color: #404040;
        height: 40px;
    }

    .order_col{
        padding: 20px;
    }
    .order_col:first-of-type{
        border-right: 1px solid #3e3e3e;
    }


    .addressIn >>> input{
        color: #fff !important;
        padding: 5px 6px !important;
        text-align: center;
        letter-spacing: 2px;
        font-size: 14px;
    }

    .addressIn >>> input::-webkit-input-placeholder{
        color: #909090 !important;
    }


    .order_list div{
        display: flex;
        padding: 2px 0px;
        text-align: left;
        margin: 0 !important;
        font-size: 12px;
    }

    .order_list p{
        margin: 0 !important;
        flex-grow: 1;
    }
    .order_list button{
        margin-left: 10px;
        opacity: 0.4;
        outline: none;
    }
    .order_list button:hover{
        opacity: 1;
    }
    .order_list span{
    }

    .checkout button{
        margin-top: 10px;
    }

    .addBut{
        color: #ccc;
        margin-top: 10px;
        background-color: transparent !important;
        border: 1px solid #ccc !important;
        flex-grow: 0;
    }

    .list_col{
        display: flex;
        flex-direction: column;
    }
    .list_cont{
        flex-grow: 1;
    }

    .readerBut{
        margin-top: 4px;
        display: flex;
        background-color: #404040;
        /*cursor: pointer;*/
    }
    .readerBut button{
        opacity: 0.6;
        outline: none;
        padding: 6px 12px;
        margin: 0px auto;
    }
    .readerBut:hover button{
        opacity: 1;
    }

    @media only screen and (max-width: 600px) {
        .order_form{
            display: block;
        }
        .asset_select button{
            flex-grow: 1;
            word-break: break-word;
        }
    }
</style>