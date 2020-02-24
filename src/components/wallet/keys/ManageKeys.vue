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
                    <p class="addressTitle">Balance</p>
                    <div class="addressBallance">
                        <p v-if="!addressBalances[address]">This address does not have any assets in it.</p>
                        <p v-else v-for="bal in addressBalances[address]" :key="bal.symbol">
                            {{bal.amount.toString()}} <b>{{bal.symbol}}</b>,
                        </p>
                    </div>
<!--                    <div class="" v-for="bal in addressBalances[address]" :key="bal.symbol">-->
<!--&lt;!&ndash;                        {{bal}}&ndash;&gt;-->
<!--                        <p></p>-->
<!--                    </div>-->
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
    import {bintools} from "@/AVA";

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
            balance(){
                return this.$store.getters.balance;
            },
            addressBalances(){
                let utxos =  this.$store.getters.addressUTXOs;

                let res = {};

                for(var i=0;i<this.addresses.length; i++){
                    let addr = this.addresses[i];
                    let addrStrip = addr.split('-')[1];


                    let addrUtxos = utxos[addrStrip];
                    if(!addrUtxos) continue;
                    res[addr] = {};

                    console.log(addrStrip);
                    console.log(addrUtxos);

                    for(var n=0; n<addrUtxos.length; n++){
                        let utxo = addrUtxos[n];

                        // console.log(utxo);
                        let amount = utxo.getAmount();
                        let assetIdBuff = utxo.getAssetID();
                        let assetId = bintools.avaSerialize(assetIdBuff);

                        let assetObj = this.balance[assetId];
                        // console.log(assetObj)
                        let asset = res[addr][assetId];
                        // console.log(asset);
                        // console.log(res);
                        if(!asset){
                            res[addr][assetId] = {
                                amount: amount,
                                name: assetObj.name,
                                symbol: assetObj.symbol
                            };
                        }else{
                            asset.amount = asset.amount.add(amount);
                        }
                    }
                }

                // console.log(this.addresses);
                // console.log(utxos);
                // console.log(res);
                return res;
            },
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
        font-size: 13px;
        font-weight: bold;
    }
    .addressVal{
        word-break: break-all;
        font-size: 14px;
        margin-bottom: 12px !important;
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

    .addressBallance{
        display: flex;
    }
    .addressBallance p{
        padding-right: 5px;
        font-size: 12px;
    }
</style>