<template>
    <div
            class="addressItem"
            :selected="is_default"
    >
        <mnemonic-phrase ref="modal" :phrase="mnemonicPhrase"></mnemonic-phrase>
        <div class="rows">
            <div class="detail">
                <div>
                    <p class="addressVal">{{address}}</p>
                </div>
            </div>

            <div >
                <p v-if="Object.keys(balances).length === 0" class="balance_empty">{{$t('keys.empty')}}</p>
                <div class="addressBalance bal_cols" v-else>
                    <p>This key has: </p>
                    <div class="bal_rows">
                        <p  v-for="bal in balances" :key="bal.id">
                            {{bal.toString()}} <b>{{bal.symbol}}</b>
                        </p>
                    </div>

                </div>
            </div>
        </div>
        <div class="buts">
            <button @click="showModal">View Key Phrase</button>
            <button class="selBut" @click="select"  v-if="!is_default">
                <span>Activate Key</span>
            </button>

            <button @click="remove" v-if="!is_default"><fa icon="trash"></fa> Remove Key</button>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import {bintools, keyChain} from "@/AVA";
    import AvaAsset from "@/js/AvaAsset";
    import {AssetsDict} from "@/store/modules/assets/types";
    import {AmountOutput, KeyPair} from "avalanche";

    import MnemonicPhrase from '@/components/modals/MnemonicPhrase.vue';
    import * as bip39 from 'bip39';
    import AvaHdWallet from "@/js/AvaHdWallet";

    interface IKeyBalanceDict{
        [key:string]: AvaAsset
    }

    @Component({
        components: {
            MnemonicPhrase
        }
    })
    export default class KeyRow extends Vue{
        // @Prop() address!:string;
        @Prop() wallet!:AvaHdWallet;
        @Prop({default: false}) is_default?:boolean;


        get address(){
            return this.wallet.masterKey.getAddressString();
        }
        get assetsDict():AssetsDict{
            return this.$store.state.Assets.assetsDict;
        }

        get balances(): IKeyBalanceDict{

            if(!this.wallet.utxoset) return {};


            // let utxos =  this.$store.getters['Assets/addressUTXOs'];
            // let addr = this.address;
            // let addrStrip = addr.split('-')[1];
            //
            // let addrUtxos = utxos[addrStrip];
            let res:IKeyBalanceDict = {};


            let addrUtxos = this.wallet.utxoset.getAllUTXOs();
            for(var n=0; n<addrUtxos.length; n++){
                let utxo = addrUtxos[n];
                let utxoOut = utxo.getOutput() as AmountOutput;

                let amount = utxoOut.getAmount();
                let assetIdBuff = utxo.getAssetID();
                let assetId = bintools.avaSerialize(assetIdBuff);

                let assetObj:AvaAsset|undefined = this.assetsDict[assetId];

                if(!assetObj){
                    let name = '?';
                    let symbol = '?';
                    let denomination = 0;

                    let newAsset = new AvaAsset(assetId,name,symbol,denomination);
                    newAsset.addBalance(amount);

                    res[assetId] = newAsset;
                    continue;
                }

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


            return res;
        }

        get keyPair():KeyPair{
            return keyChain.getKey(bintools.parseAddress(this.address, 'X'));
        }

        get mnemonicPhrase():string{
            let pk = this.keyPair.getPrivateKey();
            let hex = pk.toString('hex');
            let mnemonic = bip39.entropyToMnemonic(hex);
            return mnemonic;
        }

        remove(){
            this.$emit('remove', this.wallet);
        }
        select(){
            this.$emit('select', this.wallet);
        }

        showModal(){
            let modal = this.$refs.modal as MnemonicPhrase;
            //@ts-ignore
            modal.open();
        }
    }
</script>
<style scoped lang="scss">
    .addressItem{
        font-size: 12px;
        /*display: flex;*/
        /*align-items: center;*/
        display: grid;
        grid-template-columns: 1fr max-content;
        grid-gap: 15px;
        /*background-color: #F5F6FA;*/
        overflow: auto;

        > *{
            align-self: center;
            overflow: auto;
        }
    }

    .buts{
        display: flex;
        flex-direction: row;

        > *{
            margin-left: 15px;
        }
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
            /*margin-right: 15px;*/
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

        span{
            font-weight: normal;
            margin-right: 8px;
        }
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
        .bal_rows p{
            font-weight: bold;
            /*background-color: #ebedf5;*/
            padding: 0px 8px;
            margin-bottom: 4px;
        }
        p{

            /*border: 1px solid #ebedf5;*/
            border-radius: 3px;
        }
    }

    .bal_cols{
        display: flex;
    }

    .bal_rows{
        display: flex;
        flex-direction: column;
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
