<template>
    <div>
        <div class="cols">
            <div class="card_body">
                <h4>My Keys</h4>
                <my-keys></my-keys>
            </div>
            <div class="right_side">
                <div>
                    <h4>Add Key</h4>
                    <p class="explain">
                        Add additional private keys to use with your wallet.
                    </p>
                    <v-tabs color="#5824CF" height="25" active-class="tab_active">
                        <v-tab >Private Key</v-tab>
                        <v-tab>Keystore File</v-tab>
                        <v-tab-item>
                            <add-key-string></add-key-string>
                        </v-tab-item>
                        <v-tab-item>
                            <add-key-file></add-key-file>
                        </v-tab-item>
                    </v-tabs>
                </div>
                <div>
                    <h4>Export Wallet</h4>
                    <backup-export></backup-export>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {bintools} from "@/AVA";
    import AvaAsset from "@/js/AvaAsset";
    import BackupExport from "@/components/wallet/keys/ExportWallet";
    import AddKeyFile from "@/components/wallet/keys/AddKeyFile";
    import AddKeyString from "@/components/wallet/keys/AddKeyString";
    import MyKeys from "@/components/wallet/keys/MyKeys";
    export default {
        components: {
            BackupExport,
            AddKeyFile,
            AddKeyString,
            MyKeys
        },
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
<style scoped lang="scss">
    .cols{
        display: grid;
        grid-template-columns: 1fr 360px;
        grid-gap: 90px;
    }


    .right_side{
        display: grid;
        grid-template-rows: max-content max-content;
        grid-row-gap: 30px;
    }
    p{
        margin: 0 !important;
    }


    h4{
        font-size: 22px;
        font-weight: lighter;
    }

    .explain{
        font-size: 12px;
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

        &:last-of-type{
            border: none;
        }
    }


    .v-tab{
        border: 1px solid #999;
        margin-right: 8px;
        border-radius: 4px;
        font-size: 12px;
    }
    .tab_active{
        color: #4A2899;
        background-color: #EBE4FB !important;
        border-color: #4A2899 !important;
    }
</style>
<style lang="scss">
    .cols {
        .v-tabs-bar{
            margin: 15px 0px;
        }
        .v-tabs-slider-wrapper{
            display: none;
        }
    }
</style>
