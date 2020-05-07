<template>
    <div
            class="addressItem"
            :selected="selected"
    >
        <button class="selBut" @click="select">
            <fa icon="key"></fa>
            <span v-if="selected">Default</span>
        </button>
        <div class="rows">
            <div class="detail">
                <div>
                    <p class="label">{{$t('keys.address')}}</p>
                    <p class="addressVal">{{address}}</p>
                </div>
                <div>
                    <p class="label">Public Key</p>
                    <p class="addressVal">{{publicKey}}</p>
                </div>
            </div>

            <div class="addressBallance">
                <p class="label">{{$t('keys.balance')}}</p>
                <p v-if="!balances">{{$t('keys.empty')}}</p>
                <p v-else v-for="bal in balances" :key="bal.symbol">
                    {{bal.toString()}} <b>{{bal.symbol}}</b>
                </p>
            </div>


        </div>
        <div class="del" v-if="canRemove">
            <button @click="remove"><fa icon="trash"></fa> Remove Key</button>
        </div>
    </div>
</template>
<script>
    import {bintools, keyChain} from "@/AVA";
    import AvaAsset from "@/js/AvaAsset";

    export default {
        props: {
            address: {
                type: String,
                required: true
            },
            selected: {
                type: Boolean,
                default: false,
            },
            canRemove: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            balance(){
                return this.$store.getters['Assets/assetsDict'];
            },
            balances(){
                let res = {};

                let utxos =  this.$store.getters['Assets/addressUTXOs'];
                let addr = this.address;
                let addrStrip = addr.split('-')[1];


                let addrUtxos = utxos[addrStrip];
                if(addrUtxos){
                    for(var n=0; n<addrUtxos.length; n++){
                        let utxo = addrUtxos[n];

                        // console.log(utxo);
                        let amount = utxo.getAmount();
                        let assetIdBuff = utxo.getAssetID();
                        let assetId = bintools.avaSerialize(assetIdBuff);

                        let assetObj = this.balance[assetId];
                        let asset = res[assetId];
                        if(!asset){
                            let name = assetObj.name;
                            let symbol = assetObj.symbol;
                            let denomination = assetObj.denomination;

                            let newAsset = new AvaAsset(assetId,name,symbol,denomination);
                                newAsset.addBalance(amount);

                            res[assetId] = newAsset;
                        }else{
                            asset.addBalance(amount)
                        }
                    }
                }
                return res;
            },
            addrRaw(){
                return this.address.split('-')[1];
            },
            keyPair(){
                return   keyChain.getKey(bintools.parseAddress(this.address, 'X'));
            },
            publicKey(){
                return this.keyPair.getPublicKeyString()
            }
        },
        mounted() {
            // console.log(this.$store.state);
        },
        methods: {
            remove(){
                this.$emit('remove', this.address);
            },
            select(){
                this.$emit('select', this.address);
            }
        }
    }
</script>
<style scoped lang="scss">
    .addressItem{
        /*display: flex;*/
        /*align-items: center;*/
        display: grid;
        grid-template-columns: 40px 1fr max-content;
        grid-gap: 15px;
        padding: 15px;

        > *{
            align-self: center;
        }
    }

    .addressItem .selBut{
        /*flex-basis: 14px;*/
        /*height: 14px;*/
        /*width: 14px;*/
        /*border-radius: 14px;*/
        color: #ccc;
        flex-shrink: 0;

        span{
            font-size: 11px;
            line-height: normal;
        }
    }

    .addressItem[selected] .selBut{
        color: #866FBE;
    }

    .detail{
        /*margin-left: 20px;*/
        /*flex-grow: 1;*/
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 15px;
    }

    .label{
        font-size: 13px;
        font-weight: bold;
    }
    .addressVal{
        word-break: break-all;
        font-size: 14px;
    }

    .del{
        align-self: start;
        opacity: 0.4;
        font-size: 12px;

        &:hover{
            opacity: 1;
        }
    }

</style>
