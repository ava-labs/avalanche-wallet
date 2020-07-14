<template>
    <div
            class="addressItem"
            :selected="is_default"
    >
        <mnemonic-phrase ref="modal" :phrase="mnemonicPhrase"></mnemonic-phrase>
        <HdDerivationListModal :wallet="wallet" ref="modal_hd"></HdDerivationListModal>
        <div class="rows">
            <div class="detail">
                <p class="addressVal"><b>{{walletTitle}}</b></p>
                <Tooltip text="This key will be forgotten when you refresh the browser." v-if="isVolatile">
                    <fa icon="exclamation-triangle" class="volatile_alert"></fa>
                </Tooltip>
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
            <button @click="showPastAddresses" tooltip="Previous Addresses"><fa icon="list-ol"></fa></button>
            <button class="selBut" @click="select"  v-if="!is_default">
                <span>Activate Key</span>
            </button>

            <button @click="remove" v-if="!is_default"><fa icon="trash"></fa> Remove Key</button>
        </div>
<!--        <HDDerivationList :wallet="wallet" class="hdlist"></HDDerivationList>-->
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
    import HdDerivationListModal from "@/components/modals/HdDerivationList/HdDerivationListModal.vue";
    import * as bip39 from 'bip39';
    import AvaHdWallet from "@/js/AvaHdWallet";
    import Tooltip from '@/components/misc/Tooltip.vue';

    import {AvaWallet} from "@/js/AvaWallet";

    interface IKeyBalanceDict{
        [key:string]: AvaAsset
    }

    @Component({
        components: {
            MnemonicPhrase,
            HdDerivationListModal,
            Tooltip
        }
    })
    export default class KeyRow extends Vue{
        // @Prop() address!:string;
        @Prop() wallet!:AvaHdWallet;
        @Prop({default: false}) is_default?:boolean;


        get isVolatile(){
            return this.$store.state.volatileWallets.includes(this.wallet);
        }

        get walletTitle(){
            return this.address.split('-')[1].substring(0,4);
        }
        get address(){
            return this.wallet.masterKey.getAddressString();
        }
        get assetsDict():AssetsDict{
            return this.$store.state.Assets.assetsDict;
        }

        get balances(): IKeyBalanceDict{

            if(!this.wallet.getUTXOSet()) return {};

            let res:IKeyBalanceDict = {};


            let addrUtxos = this.wallet.getUTXOSet().getAllUTXOs();
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
            return this.wallet.masterKey;
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

        showPastAddresses(){
            let modal = this.$refs.modal_hd as MnemonicPhrase;
            //@ts-ignore
            modal.open();
        }
    }
</script>
<style scoped lang="scss">
@use '../../../main';

    .addressItem{
        font-size: 12px;
        display: grid;
        grid-template-columns: 1fr max-content;
        grid-gap: 15px;
        overflow: auto;

        > *{
            align-self: center;
            overflow: auto;
        }
    }

    .hdlist{
        grid-column: 1/3;
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
        color: #ccc;
        flex-shrink: 0;

        span{
            font-size: 12px;
            line-height: normal;
        }
    }

    .addressItem{
        .selBut{
            flex-grow: 1;
            background-color: #C0C0CD;
            color: #fff;
            padding: 4px 8px;
        }
    }

    .detail{
        overflow: auto;
        display: grid;
        grid-template-columns: max-content max-content;
        column-gap: 15px;
    }

    .label{
        font-weight: bold;
    }
    .addressVal{
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
        color: main.$primary-color;
        .bal_rows p{
            font-weight: bold;
            padding: 0px 8px;
            margin-bottom: 4px;
        }
        p{
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
        color: main.$primary-color;
    }

    .volatile_alert{
        color: #f00;
    }
</style>
