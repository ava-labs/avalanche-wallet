<template>
    <modal ref="modal" title="My Addresses">
        <div>
            <div class="addressItem"
                 v-for="(address, index) in addresses" :key="address"
                 :selected="selected === address"
            >
                <button @click="select(address)"></button>
                <div class="details">
                    <p class="addressTitle">Address {{index}}</p>
                    <p class="addressVal">{{address}}</p>
                </div>
            </div>
        </div>
    </modal>
</template>
<script>
    import Modal from "./Modal";

    import { avm } from '@/AVA';

    export default {
        components: {
            Modal
        },
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
        },
        computed: {
            selected(){
                return this.$store.state.selectedAddress;
            },
            addresses(){
                return this.$store.state.addresses;
                // let addresses = avm.keyChain().getAddressStrings();
                // return addresses;
            }
        },
        mounted() {
        }
    }
</script>
<style scoped>
    p{
        margin: 0;
    }
    .addressItem{
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #b2b2b2;
    }
    .addressItem button{
        flex-basis: 14px;
        background-color: #808080;
        height: 14px;
        width: 14px;
        border-radius: 14px;
    }
    .addressItem[selected] button{
        background-color: #42b983;
    }

    .details{
        margin-left: 20px;
    }

    .addressTitle{
        font-size: 12px;
        font-weight: bold;
    }
    .addressVal{
        word-break: break-all;
        font-size: 14px;
    }
</style>