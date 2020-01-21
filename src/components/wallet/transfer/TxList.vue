<template>
    <div>
<!--        <div class="list_item">-->
<!--            <button><fa icon="minus"></fa></button>-->
<!--            <currency-input-dropdown></currency-input-dropdown>-->
<!--        </div>-->
        <div v-for="(tx, i) in tx_list" :key="tx.id" class="list_item">
            <button @click="removeTx(i)"><fa icon="minus"></fa></button>
            <currency-input-dropdown class="list_in"></currency-input-dropdown>
        </div>
        <div class="list_item" empty="true">
            <button @click="addTx"><fa icon="plus"></fa></button>
            <currency-input-dropdown class="list_in"></currency-input-dropdown>
        </div>
    </div>
</template>
<script>
    const uuidv1 = require('uuid/v1');

    import CurrencyInputDropdown from "@/components/misc/CurrencyInputDropdown";
    // import Dropdown from "@/components/misc/Dropdown";
    export default {
        components: {
            CurrencyInputDropdown,
          // Dropdown
        },
        data(){
            return {
                tx_list: [],
            }
        },
        methods: {
            removeTx(index){
                this.tx_list.splice(index,1);
            },
            addTx(){

                if(this.tx_list.length >= this.assets_list.length){
                    return;
                }

                let id = uuidv1();
                this.tx_list.push({
                    id: id,
                    asset: this.assets_list[0],
                    amount: 0,
                });


            },
            onDropInput(){

            }
        },
        mounted() {
            this.addTx();
        },
        computed: {
            assets_list(){
                let res = [];
                for(var i in this.assets){
                    res.push(this.assets[i]);
                }
                return res;
            },
            assets(){
                return this.$store.getters.balance;
            },
        }
    }
</script>
<style scoped>
    .list_item{
        position: relative;
        display: flex;
        padding: 2px 0px;
    }

    .list_item button{
        position: relative;
        height: 20px;
        outline: none;
        width: 20px;
        flex-basis: 20px;
        margin: auto 8px;
        font-size: 12px;
        border: 1px solid;
        border-radius: 50%;
        background-color: #303030;
        transition-duration: 0.2s;
        flex-shrink: 0;
    }

    .list_in{

    }

    .list_item button:hover{
        background-color: #909090;
        color: #303030;
    }

    .list_item:before{
        content: '';
        position: absolute;
        height: 100%;
        width: 19px;
        border-right: 1px dashed #d2d2d2;
        opacity: 0.4;
    }

    .list_item[empty] button{
        opacity: 0.8;
    }
    .list_item[empty] .list_in, .list_item[empty]:before{
        opacity: 0.3;
        transition-duration: 0.2s;
    }
    .list_item[empty] button:hover{
        opacity: 1;
    }
    .list_item[empty] .list_in{
        pointer-events: none;
    }
 </style>