<template>
    <div
            class="addressItem"
            :selected="selected"
    >
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

            <div >
                <p class="label">{{$t('keys.balance')}}</p>
                <p v-if="Object.keys(balances).length === 0" class="balance_empty">{{$t('keys.empty')}}</p>
                <div class="addressBalance" v-else>
                    <p  v-for="bal in balances" :key="bal.id">
                        {{bal.toString()}} <b>{{bal.symbol}}</b>
                    </p>
                </div>
            </div>
        </div>
        <div class="buts">
            <button class="selBut" @click="select">
                <span v-if="selected">Default</span>
                <span v-else>Make Default</span>
            </button>

            <button @click="remove" v-if="canRemove"><fa icon="trash"></fa> Remove Key</button>

        </div>
<!--        <div class="del" v-if="canRemove">-->
<!--        </div>-->
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
                return this.$store.state.Assets.assetsDict;
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
        font-size: 12px;
        /*display: flex;*/
        /*align-items: center;*/
        border-radius: 2px;
        display: grid;
        grid-template-columns: 1fr 30%;
        grid-gap: 15px;
        padding: 15px;
        background-color: #F5F6FA;
        overflow: auto;

        > *{
            align-self: center;
            overflow: auto;
        }
    }

    .buts{
        display: flex;
        flex-direction: row;
    }

    .rows{
        overflow: auto;
    }
    .addressItem .selBut{
        /*flex-basis: 14px;*/
        /*height: 14px;*/
        /*width: 14px;*/
        /*border-radius: 14px;*/
        color: #ccc;
        flex-shrink: 0;

        span{
            font-size: 12px;
            line-height: normal;
        }
    }

    .addressItem{
        &[selected]{
            .selBut{
                /*background-color: transparent;*/
            }
        }
        .selBut{
            flex-grow: 1;
            background-color: #C0C0CD;
            color: #fff;
            padding: 4px 8px;
            margin-right: 15px;
        }
    }

    .detail{
        /*margin-left: 20px;*/
        /*flex-grow: 1;*/
        overflow: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 15px;
    }

    .label{
        /*font-size: 13px;*/
        font-weight: bold;
    }
    .addressVal{
        /*word-break: break-all;*/
        overflow: auto;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .del{
        align-self: start;
        opacity: 0.4;

        &:hover{
            opacity: 1;
        }
    }

    .addressBalance{
        display: flex;
        white-space: nowrap;
        color: #2960CD;
        p{
            padding: 2px 8px;
            /*border: 1px solid #ebedf5;*/
            background-color: #ebedf5;
            border-radius: 3px;
            margin: 2px !important;
        }
    }

    .balance_empty{
        color: #2960CD;
    }
    /*.addressItem[selected]{*/
    /*    .addressBalance{*/
    /*        p{*/
    /*            background-color: #b1c9fb;*/
    /*        }*/
    /*    }*/
    /*}*/

</style>
