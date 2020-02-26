<template>
    <div>
        <h2>{{$t('keys.title')}}</h2>
        <div class="card_body">
            <div
                    class="addressItem"
                    v-for="(address, index) in addresses" :key="address"
                    :selected="selected === address"
            >
                <button class="selBut" @click="select(address)"></button>
                <div class="details">
                    <p class="addressTitle">{{$t('keys.address')}} {{index}}</p>
                    <p class="addressVal">{{address}}</p>
                    <p class="addressTitle">{{$t('keys.balance')}}</p>
                    <div class="addressBallance">
                        <p v-if="!addressBalances[address]">{{$t('keys.empty')}}</p>
                        <p v-else v-for="bal in addressBalances[address]" :key="bal.symbol">
                            {{bal.toString()}} <b>{{bal.symbol}}</b>
                        </p>
                    </div>
                </div>
                <div class="buts" v-if="addresses.length > 1">
                    <button @click="removeKey(address)"><fa icon="trash"></fa></button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {bintools} from "@/AVA";
    import AvaAsset from "@/js/AvaAsset";

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

                let msg = this.$t('keys.del_check');
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
                return this.$store.getters['Assets/assetsDict'];
            },
            addressBalances(){
                let utxos =  this.$store.getters['Assets/addressUTXOs'];
                let res = {};

                for(var i=0;i<this.addresses.length; i++){
                    let addr = this.addresses[i];
                    let addrStrip = addr.split('-')[1];


                    let addrUtxos = utxos[addrStrip];
                    if(!addrUtxos) continue;
                    res[addr] = {};


                    for(var n=0; n<addrUtxos.length; n++){
                        let utxo = addrUtxos[n];

                        // console.log(utxo);
                        let amount = utxo.getAmount();
                        let assetIdBuff = utxo.getAssetID();
                        let assetId = bintools.avaSerialize(assetIdBuff);

                        let assetObj = this.balance[assetId];
                        let asset = res[addr][assetId];
                        if(!asset){
                            let name = assetObj.name;
                            let symbol = assetObj.symbol;
                            let denomination = assetObj.denomination;

                            let newAsset = new AvaAsset(assetId,name,symbol,denomination);
                                newAsset.addBalance(amount);

                            res[addr][assetId] = newAsset;
                        }else{
                            asset.addBalance(amount)
                        }
                    }
                }
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
        flex-shrink: 0;
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
        white-space: normal;
        flex-wrap: wrap;
    }

    .addressBallance p:first-child{
        padding-left: 0;
    }
    .addressBallance p{
        padding: 0 5px;
        font-size: 12px;
        flex-shrink: 0;
        border-right: 1px solid #dedede;
    }
</style>