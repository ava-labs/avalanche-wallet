<template>
    <div>
        <div class="table_title">
            <p>Amount</p>
            <p>Type</p>
        </div>
        <div v-for="(tx, i) in tx_list" :key="tx.uuid" class="list_item">
<!--            <button @click="removeTx(i)"><fa icon="minus"></fa></button>-->
            <currency-input-dropdown
                    class="list_in"
                    @change="oninputchange(i,$event)"
                    :disabled_assets="disabledAssets[i]"
                    :initial="tx.asset"
            ></currency-input-dropdown>
            <button @click="removeTx(i)" v-if="i !== 0 || tx_list.length>1">Remove Asset</button>
        </div>
        <v-btn block depressed @click="addTx()" class="add_asset" color="#fafafa" :ripple="false" v-if="showAdd"> <fa icon="plus"></fa></v-btn>
    </div>
</template>
<script>
    const uuidv1 = require('uuid/v1');

    import CurrencyInputDropdown from "@/components/misc/CurrencyInputDropdown";
    export default {
        components: {
            CurrencyInputDropdown,
        },
        data(){
            return {
                tx_list: [],
                available_assets: [],
                disabledAssets: [],
                next_initial: null,
            }
        },
        methods: {
            updateUnavailable(){
                let res = [];
                let allDisabled = [];


                for(var i=0; i<this.tx_list.length; i++){
                    let localDisabled = [];

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
                // console.log("UPDATE DISABLED:",this.disabledAssets);
                // console.log("NEXT INITIAL:",this.next_initial);
            },
            oninputchange(index, event) {
                this.tx_list[index].asset = event.asset;
                this.tx_list[index].amount = event.amount;

                this.updateUnavailable();

                this.$emit('change', this.tx_list);
            },
            removeTx(index){
                if(this.tx_list.length===1) return;
                this.tx_list.splice(index,1);
                this.updateUnavailable();
                this.$emit('change', this.tx_list);
            },
            addTx(id){
                if(this.tx_list.length >= this.assets_list.length){
                    return;
                }

                let uuid = uuidv1();

                if(id){
                    this.tx_list.push({
                        uuid: uuid,
                        asset: this.assets[id],
                        amount: 0,
                    });
                }else{
                    // console.log("initial before: ", this.next_initial);
                    this.tx_list.push({
                        uuid: uuid,
                        asset: this.next_initial,
                        amount: 0,
                    });
                }
                this.$emit('change', this.tx_list);
            },
            // clears the list and leaves 1 empty order
            clear(){
                for(var i=this.tx_list.length-1;i>=1;i--){
                    this.removeTx(i);
                }
            }
        },
        mounted() {
            this.next_initial = this.assets_list[0];
            if(this.$route.query.asset){
                let code = this.$route.query.asset;
                for(var id in this.assets){
                    let asset = this.assets[id];
                    if(asset.code === code){
                        this.addTx(asset.id);
                        return;
                    }
                }
            }
            this.addTx();
        },
        computed: {
            assets_list(){
                return this.$store.getters['Assets/assetsArray'];

            },
            assets(){
                return this.$store.getters['Assets/assetsDict'];
            },
            showAdd(){
                if(this.tx_list.length === this.assets_list.length || this.assets_list.length===0){
                    return false;
                }
                return true;
            }
        }
    }
</script>
<style scoped>
    .table_title{
        display: flex;
        margin-bottom: 5px;
    }
    .table_title p{
        margin: 0;
        font-weight: bold;
        font-size: 18px;
        text-align: left;
        padding-right: 100px;
    }
    .table_title p:first-of-type{
        flex-grow: 1;
    }


    .list_item{
        position: relative;
        display: flex;
        flex-direction: column;
        /*display: flex;*/
        margin-bottom: 12px;
        padding: 2px 0px;
    }

    .list_in{
        flex-grow: 1;

    }

    .list_item button{
        width: 100%;
        text-align: right;
        font-size: 12px;
        color: #b2b2b2;
    }



    .list_item button:hover{
        /*background-color: #f2f2f2;*/
        color: #42b983;
    }


    .add_asset{
        border-radius: 0;
        color: #505050;
        background-color: #6ca771;
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