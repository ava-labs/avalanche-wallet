<template>
    <div class="list_cont">
        <div v-if="derivedKeys.length>0" class="list">
            <div class="headers">
                <p style="text-align: center">#</p>
                <p>Address</p>
                <p class="col_bal">Balance</p>
            </div>
            <HdDerivationListRow v-for="(key,i) in derivedKeys" :key="i" :index="i" :key-pair="key" :balance="keyBalances[i]" class="list_row"
            ></HdDerivationListRow>
        </div>
        <div v-else>
            <p class="empty">You have no past addresses.</p>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

    import AvaHdWallet from "@/js/AvaHdWallet";
    import {AVMKeyPair, UTXOSet} from "avalanche";
    import {bintools} from "@/AVA";
    import BN from "bn.js";
    import Big from 'big.js';
    import AvaAsset from "@/js/AvaAsset";
    import HdDerivationListRow from "@/components/modals/HdDerivationList/HdDerivationListRow.vue";
    import {DerivationListBalanceDict} from "@/components/modals/HdDerivationList/types";

    @Component({
        components: {
            HdDerivationListRow
        }
    })
    export default class HDDerivationList extends Vue{
        @Prop() wallet!: AvaHdWallet;

        derivedKeys: AVMKeyPair[] = [];


        @Watch('wallet.hdIndex', {immediate: true})
        onIndexChange(){
            this.derivedKeys = this.wallet.getAllDerivedKeys();
        }


        get assetsDict(){
            return this.$store.state.Assets.assetsDict;
        }

        get keyBalances(): DerivationListBalanceDict[]{
            let wallet = this.wallet;
            let utxoSet = wallet.utxoset;
            let assetsDict = this.assetsDict;

            let balances = this.derivedKeys.map(key => {
                let addr = key.getAddress();
                let utxoIds =  utxoSet.getUTXOIDs([addr]);
                let utxos = utxoSet.getAllUTXOs(utxoIds);

                let newSet = new UTXOSet();
                    newSet.addArray(utxos);
                let assetIds = newSet.getAssetIDs();

                let balDict:DerivationListBalanceDict = {};
                for(var i=0; i<assetIds.length; i++){
                    let assetId = assetIds[i];
                    let balance = newSet.getBalance([addr], assetId);
                    let assetIdSerial = bintools.avaSerialize(assetId);

                    let target:Big = balDict[assetIdSerial];
                    let asset:AvaAsset = assetsDict[assetIdSerial];

                    if(!asset) continue;

                    if(target){
                        target = target.add(balance.toString());
                    }else{
                        balDict[assetIdSerial] = Big(balance.toString()).div(Math.pow(10,asset.denomination));
                    }
                }
                return balDict;
            });

            return balances;
        }
    }
</script>
<style scoped lang="scss">
    .list_cont{
        max-height: 60vh;
        height: 290px;
        position: relative;
        overflow: scroll;
    }

    .list_row{
        border-bottom: 1px solid #ddd;

        &:last-of-type{
            border: none;
        }
    }

    .headers{
        position: sticky;
        top: 0;
        border-bottom: 1px solid #888;
        font-weight: bold;
        background-color: #fff;
    }

    .headers, .list_row{
        display: grid;
        grid-template-columns: 25px 90px 1fr;
        padding: 5px 0px;
        column-gap: 10px;
    }


    .col_bal{
        text-align: right;
        padding-right: 15px;
    }


    .empty{
        width: 100%;
        text-align: center;
        padding: 30px;
    }
</style>
