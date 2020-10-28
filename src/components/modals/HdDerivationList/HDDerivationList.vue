<template>
    <div class="list_cont">
        <v-tabs grow>
            <v-tab>Internal</v-tab>
            <v-tab>External</v-tab>
            <v-tab>Platform</v-tab>
            <v-tab-item>
                <div v-if="numInternalKeys>0" class="list">
                    <div class="headers">
                        <p style="text-align: center">#</p>
                        <p>{{$t('portfolio.address')}}</p>
                        <p class="col_bal">{{$t('portfolio.balance')}}</p>
                    </div>
                    <HdDerivationListRow v-for="(addr,i) in addrsInternal" :key="addr" :index="i" :address="addr" :balance="keyBalancesInternal[i]" class="list_row"
                    ></HdDerivationListRow>
                </div>
                <div v-else>
                    <p class="empty">You do not have any past addresses.</p>
                </div>
            </v-tab-item>
            <v-tab-item>
                <div v-if="numExternalKeys>0" class="list">
                    <div class="headers">
                        <p style="text-align: center">#</p>
                        <p>{{$t('portfolio.address')}}</p>
                        <p class="col_bal">{{$t('portfolio.balance')}}</p>
                    </div>
                    <HdDerivationListRow v-for="(addr,i) in addrsExternal" :key="addr" :index="i" :address="addr" :balance="keyBalancesExternal[i]" class="list_row"
                    ></HdDerivationListRow>
                </div>
                <div v-else>
                    <p class="empty">{{$t('portfolio.noaddresses')}}</p>
                </div>
            </v-tab-item>
            <v-tab-item>
                <div class="headers">
                    <p style="text-align: center">#</p>
                    <p>{{$t('portfolio.address')}}</p>
                    <p class="col_bal">{{$t('portfolio.balance')}}</p>
                </div>
                <HdDerivationListRow v-for="(addr,i) in addrsPlatform" :key="addr" :index="i" :address="addr" :balance="keyBalancesPlatform[i]" class="list_row"
                ></HdDerivationListRow>
            </v-tab-item>
        </v-tabs>

    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

    import AvaHdWallet from "@/js/wallets/AvaHdWallet";
    import {KeyPair as AVMKeyPair, UTXOSet as AVMUTXOSet} from "avalanche/dist/apis/avm";
    import {UTXOSet as PlatformUTXOSet} from "avalanche/dist/apis/platformvm";
    import {ava, bintools} from "@/AVA";
    import Big from 'big.js';
    import AvaAsset from "@/js/AvaAsset";
    import HdDerivationListRow from "@/components/modals/HdDerivationList/HdDerivationListRow.vue";
    import {DerivationListBalanceDict} from "@/components/modals/HdDerivationList/types";
    import {KeyPair as PlatformVMKeyPair} from "avalanche/dist/apis/platformvm";

    @Component({
        components: {
            HdDerivationListRow
        }
    })
    export default class HDDerivationList extends Vue{
        @Prop() wallet!: AvaHdWallet;

        addrsExternal: string[] = [];
        addrsInternal: string[] = [];
        addrsPlatform: string[] = [];

        @Watch('wallet.internalHelper.utxoSet', {immediate: true})
        onInternalUtxoChange(){
            this.addrsInternal = this.wallet.internalHelper.getAllDerivedAddresses();
        }

        @Watch('wallet.externalHelper.utxoSet', {immediate: true})
        onExternalUtxoChange(){
            this.addrsExternal = this.wallet.externalHelper.getAllDerivedAddresses();
        }

        @Watch('wallet.platformHelper.utxoSet', {immediate: true})
        onPlatformUtxoChange(){
            this.addrsPlatform = this.wallet.platformHelper.getAllDerivedAddresses();
        }


        get assetsDict(){
            return this.$store.state.Assets.assetsDict;
        }

        get keyBalancesExternal(): DerivationListBalanceDict[]{
            let wallet = this.wallet;
            let utxoSet = wallet.externalHelper.utxoSet as AVMUTXOSet;
            let addrs = this.addrsExternal;

            return  this.utxoSetToBalanceDict<AVMKeyPair>(utxoSet, addrs);
        }


        utxoSetToBalanceDict<KeyType extends AVMKeyPair|PlatformVMKeyPair>(set: AVMUTXOSet|PlatformUTXOSet, addrs: string[]): DerivationListBalanceDict[]{
            let assetsDict = this.assetsDict;


            let balances: DerivationListBalanceDict[] = addrs.map(addr => {
                let newSet = set.clone();

                let chainID = addr.split('-')[0];
                // get asset ids owned by this key
                let assetIds = newSet.getAssetIDs();
                let addrBuffer = bintools.parseAddress(addr,chainID)

                let balDict:DerivationListBalanceDict = {};

                // Loop through assets ids and sum the utxos
                for(var i=0; i<assetIds.length; i++){
                    let assetId = assetIds[i];
                    let balance = newSet.getBalance([addrBuffer], assetId);
                    let assetIdSerial = bintools.cb58Encode(assetId);

                    let target:Big = balDict[assetIdSerial];
                    let asset:AvaAsset = assetsDict[assetIdSerial];

                    if(!asset) continue;

                    // if asset id exists in the balance dict, add to it
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

        get numExternalKeys(){
            return this.addrsExternal.length;
        }

        get numInternalKeys(){
            return this.addrsInternal.length;
        }

        get keyBalancesInternal(): DerivationListBalanceDict[]{
            let wallet = this.wallet;
            let utxoSet = wallet.internalHelper.utxoSet;
            let addrs = this.addrsInternal;
            return this.utxoSetToBalanceDict<AVMKeyPair>(utxoSet,addrs);
        }


        get keyBalancesPlatform(): DerivationListBalanceDict[]{
            let wallet = this.wallet;
            let utxoSet = wallet.platformHelper.utxoSet;
            let addrs = this.addrsPlatform;
            return this.utxoSetToBalanceDict<PlatformVMKeyPair>(utxoSet,addrs);
        }
    }
</script>
<style lang="scss">
    .list_cont{
        .v-tabs-bar{
            background-color: var(--bg-light) !important;
        }

        .list_row:last-of-type{
            > .col_index, .col_addr{
                /*border-left: 2px solid var(--secondary-color);*/
                /*position: relative;*/
                color: var(--secondary-color);
                /*background-color: #42b983;*/

            }
        }
    }
</style>
<style scoped lang="scss">
    .list_cont{
        max-height: 60vh;
        /*height: 290px;*/
        position: relative;
        overflow: scroll;
    }

    .list_row{
        border-bottom: 1px solid var(--bg-light);

        &:last-of-type{
            border: none;
        }
    }

    .headers{
        position: sticky;
        top: 0;
        border-bottom: 1px solid var(--bg-light);
        font-weight: bold;
        background-color: var(--bg-light);
    }

    .headers, .list_row{
        display: grid;
        grid-template-columns: 35px max-content 1fr;
        padding: 5px 0px;
        column-gap: 10px;
    }


    .col_bal{
        text-align: right;
        padding-right: 15px;
        padding-left: 15px;
    }


    .empty{
        width: 100%;
        text-align: center;
        padding: 30px;
    }
</style>
