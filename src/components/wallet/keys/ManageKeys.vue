<template>
    <div>
        <h2>Manage Keys</h2>
        <div class="card_body">
            <div
                    class="addressItem"
                    v-for="(address, index) in addresses" :key="address"
                    :selected="selected === address"
            >
                <button class="selBut" @click="select(address)"></button>
                <div class="details">
                    <p class="addressTitle">Address {{index}}</p>
                    <p class="addressVal">{{address}}</p>
                </div>
                <div class="buts" v-if="addresses.length > 1">
                    <button @click="removeKey(address)"><fa icon="trash"></fa></button>
                </div>
            </div>
        </div>
<!--        {{addressBalances}}-->
    </div>
</template>
<script>
    export default {
        data(){
            return{

            }
        },
        methods: {
            select(val){
                this.$store.commit('selectAddress', val);
            },
            open(){
                this.$refs.modal.open();
            },
            removeKey(address){

                let msg = 'Are you sure you want to delete this key and address from your wallet? You will not be able to use the funds associated with it anymore.';
                let isConfirm = confirm(msg);

                if(isConfirm){
                    this.$store.dispatch('removeKey', address)
                }
            }
        },
        computed: {
            addresses(){
                return this.$store.state.addresses;
            },
            selected(){
                return this.$store.state.selectedAddress;
            },
            addressBalances(){
                console.log(this.addresses)
               return null;
            }
        }
    }
</script>
<style scoped>
    p{
        margin: 0 !important;
    }
    .addressItem{
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px dashed #eaeaea;
    }
    .addressItem .selBut{
        flex-basis: 14px;
        background-color: #808080;
        height: 14px;
        width: 14px;
        border-radius: 14px;
    }
    .addressItem[selected] .selBut{
        background-color: #42b983;
    }

    .details{
        margin-left: 20px;
        flex-grow: 1;
    }

    .addressTitle{
        font-size: 12px;
        font-weight: bold;
    }
    .addressVal{
        word-break: break-all;
        font-size: 14px;
    }

    .buts{
        display: flex;
        align-items: center;
    }

    .buts button{
        opacity: 0.4;
        transition-duration: 0.1s;
    }

    .buts button:hover{
        opacity: 1;
    }
</style>