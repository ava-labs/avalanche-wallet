<template>
    <div>
<!--        <div-->
<!--                class="addressItem"-->
<!--                v-for="(address, index) in addresses" :key="address"-->
<!--                :selected="selected === address"-->
<!--        >-->
<!--            <button class="selBut" @click="selectKey(address)"></button>-->
<!--            <div class="details">-->
<!--                <p class="addressTitle">{{$t('keys.address')}} {{index}}</p>-->
<!--                <p class="addressVal">{{address}}</p>-->
<!--                <p class="addressTitle">{{$t('keys.balance')}}</p>-->
<!--                <div class="addressBallance">-->
<!--                    <p v-if="!addressBalances[address]">{{$t('keys.empty')}}</p>-->
<!--                    <p v-else v-for="bal in addressBalances[address]" :key="bal.symbol">-->
<!--                        {{bal.toString()}} <b>{{bal.symbol}}</b>-->
<!--                    </p>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div class="buts" v-if="addresses.length > 1">-->
<!--                <button @click="removeKey(address)"><fa icon="trash"></fa></button>-->
<!--            </div>-->
<!--        </div>-->

        <key-row v-for="addr in addresses"
                 :key="addr"
                 :address="addr"
                 :selected="selected === addr"
                 :can-remove="addresses.length > 1"
                 @select="selectKey"
                 @remove="removeKey"
        ></key-row>
    </div>
</template>
<script>
    import {bintools} from "../../../AVA";
    import AvaAsset from "../../../js/AvaAsset";
    import KeyRow from "@/components/wallet/keys/KeyRow";

    export default {
        components: {
            KeyRow
        },
        methods: {
            selectKey(addr){
                this.$store.commit('selectAddress', addr);
            },
            removeKey(addr){

                let msg = this.$t('keys.del_check');
                let isConfirm = confirm(msg);

                if(isConfirm){
                    this.$store.dispatch('removeKey', addr)
                }
            }
        },
        computed: {
            selected(){
                return this.$store.state.selectedAddress;
            },
            addresses(){
                return this.$store.state.addresses;
            },
            balance(){
                return this.$store.getters['Assets/assetsDict'];
            },

        }
    }
</script>
<style scoped lang="scss">
    .addressItem {
        border-bottom: 1px solid #ddd;
    }


</style>
