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
                        <p>Address</p>
                        <p class="col_bal">Balance</p>
                    </div>
                    <HdDerivationListRow v-for="(key,i) in keysInternal" :key="key.getAddressString()" :index="i" :key-pair="key" :balance="keyBalancesInternal[i]" class="list_row"
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
                        <p>Address</p>
                        <p class="col_bal">Balance</p>
                    </div>
                    <HdDerivationListRow v-for="(key,i) in keysExternal" :key="key.getAddressString()" :index="i" :key-pair="key" :balance="keyBalancesExternal[i]" class="list_row"
                    ></HdDerivationListRow>
                </div>
                <div v-else>
                    <p class="empty">You do not have any past addresses.</p>
                </div>
            </v-tab-item>
            <v-tab-item>
                <div class="headers">
                    <p style="text-align: center">#</p>
                    <p>Address</p>
                    <p class="col_bal">Balance</p>
                </div>
                <HdDerivationListRow v-for="(key,i) in keysPlatform" :key="key.getAddressString()" :index="i" :key-pair="key" :balance="keyBalancesPlatform[i]" class="list_row"
                ></HdDerivationListRow>
            </v-tab-item>
        </v-tabs>

    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

    import AvaHdWallet from "@/js/AvaHdWallet";
    import {AVMKeyPair, UTXOSet as AVMUTXOSet} from "avalanche/dist/apis/avm";
    import {UTXOSet as PlatformUTXOSet} from "avalanche/dist/apis/platformvm";
    import {bintools} from "@/AVA";
    import Big from 'big.js';
    import AvaAsset from "@/js/AvaAsset";
    import HdDerivationListRow from "@/components/modals/HdDerivationList/HdDerivationListRow.vue";
    import {DerivationListBalanceDict} from "@/components/modals/HdDerivationList/types";
    import {PlatformVMKeyPair} from "avalanche/dist/apis/platformvm";
    import {SECP256k1KeyPair} from "avalanche/src/common/secp256k1";

    @Component({
        components: {
            HdDerivationListRow
        }
    })
    export default class HDDerivationList extends Vue{
        @Prop() wallet!: AvaHdWallet;

        keysExternal: AVMKeyPair[] = [];
        keysInternal: AVMKeyPair[] = [];
        keysPlatform: PlatformVMKeyPair[] = [];


        // TODO: this is breaking reactivity
        // @Watch('wallet.hdIndex', {immediate: true})
        // onIndexChange(){
        //     this.derivedKeys = this.wallet.getAllDerivedKeys();
        //     this.derivedKeysInternal = this.wallet.getAllDerivedKeys(true);
        // }


        @Watch('wallet.internalHelper.utxoSet', {immediate: true})
        onInternalUtxoChange(){
            this.keysInternal = this.wallet.internalHelper.getAllDerivedKeys() as AVMKeyPair[];
        }

        @Watch('wallet.externalHelper.utxoSet', {immediate: true})
        onExternalUtxoChange(){
            this.keysExternal = this.wallet.externalHelper.getAllDerivedKeys() as AVMKeyPair[];
        }

        @Watch('wallet.platformHelper.utxoSet', {immediate: true})
        onPlatformUtxoChange(){
            this.keysPlatform = this.wallet.platformHelper.getAllDerivedKeys() as PlatformVMKeyPair[];
        }


        get assetsDict(){
            return this.$store.state.Assets.assetsDict;
        }

        // get keyBalances(): DerivationListBalanceDict[]{
        //     let externalBals = this.keyBalancesExternal;
        //     let internalBals = this.keyBalancesInternal;
        //
        //     let sum:DerivationListBalanceDict[] = [];
        //
        //     console.log(externalBals, internalBals);
        //
        //     for(var i=0;i<externalBals.length;i++){
        //         let balEx = externalBals[i];
        //         let balIn = internalBals[i];
        //
        //         let joined:DerivationListBalanceDict = {}
        //
        //         for(var id in balEx){
        //             let amt = balEx[id];
        //             joined[id] = amt;
        //         }
        //
        //         for(id in balIn){
        //             let amt = balIn[id];
        //             if(joined[id]){
        //                 joined[id].add(amt)
        //             }else{
        //                 joined[id] = amt;
        //             }
        //         }
        //
        //         sum.push(joined);
        //     }
        //
        //     return sum;
        // }

        get keyBalancesExternal(): DerivationListBalanceDict[]{
            let wallet = this.wallet;
            let utxoSet = wallet.externalHelper.utxoSet as AVMUTXOSet;
            let keys = this.keysExternal;
            return  this.utxoSetToBalanceDict<AVMKeyPair>(utxoSet, keys);
        }


        utxoSetToBalanceDict<KeyType extends AVMKeyPair|PlatformVMKeyPair>(set: AVMUTXOSet|PlatformUTXOSet, keys: KeyType[]): DerivationListBalanceDict[]{
            let assetsDict = this.assetsDict;

            let balances: DerivationListBalanceDict[] = keys.map(key => {
                let addr = key.getAddress();
                let newSet = set.clone();

                // get asset ids owned by this key
                let assetIds = newSet.getAssetIDs();

                let balDict:DerivationListBalanceDict = {};

                // Loop through assets ids and sum the utxos
                for(var i=0; i<assetIds.length; i++){
                    let assetId = assetIds[i];
                    let balance = newSet.getBalance([addr], assetId);
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
            return this.keysExternal.length;
        }

        get numInternalKeys(){
            return this.keysInternal.length;
        }

        get keyBalancesInternal(): DerivationListBalanceDict[]{
            let wallet = this.wallet;
            let utxoSet = wallet.internalHelper.utxoSet;
            let keys = this.keysInternal;
            return this.utxoSetToBalanceDict<AVMKeyPair>(utxoSet,keys);
        }


        get keyBalancesPlatform(): DerivationListBalanceDict[]{
            let wallet = this.wallet;
            let utxoSet = wallet.platformHelper.utxoSet;
            let keys = this.keysPlatform;
            return this.utxoSetToBalanceDict<PlatformVMKeyPair>(utxoSet,keys);
        }
    }
</script>
<style lang="scss">
    .list_cont{
        .v-tabs-bar{
            background-color: var(--bg-light) !important;
        }
    }
</style>
<style scoped lang="scss">
    .list_cont{
        max-height: 60vh;
        height: 290px;
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
