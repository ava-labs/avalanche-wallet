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
