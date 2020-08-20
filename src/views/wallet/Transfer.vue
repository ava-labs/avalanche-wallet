<template>
    <div class="transfer_card">
        <h1>{{$t('transfer.title')}}</h1>
        <div v-if="networkStatus !== 'connected'" class="disconnected">
            <p>Unable to send assets. Disconnected from the network.</p>
        </div>
        <div class="card_body" v-else>
            <div class="new_order_Form">
                <div class="lists">
                    <h4>Fungibles</h4>
                    <tx-list class="tx_list" ref="txList" @change="updateTxList"></tx-list>
                    <template v-if="hasNFT">
                        <h4>Collectibles - {{nftOrders.length}} Selected</h4>
                        <NftList @change="updateNftList" ref="nftList"></NftList>
                    </template>
                </div>
                <div>
                    <div class="fees">
                        <h4>{{$t('transfer.fees')}}</h4>
                        <p>{{$t('transfer.fee_tx')}} <span>{{txFee.toLocaleString(9)}} AVAX</span></p>
                    </div>
<!--                    <div class="advanced">-->
<!--                        <v-expansion-panels accordion class="advanced_panel" flat>-->
<!--                            <v-expansion-panel>-->
<!--                                <v-expansion-panel-header>{{$t('transfer.advanced')}}</v-expansion-panel-header>-->
<!--                                <v-expansion-panel-content>-->
<!--                                    <label>{{$t('transfer.adv_change')}}</label>-->
<!--                                    <p class="explain">Where to send the remaining assets after the transaction.</p>-->
<!--                                    <radio-buttons class="radio_buttons" :default_val="selectedAddress" :value="addresses" @change="changeAddressesChange"></radio-buttons>-->
<!--                                    &lt;!&ndash;                                <address-dropdown :default_val="selectedAddress" @change="changeAddressesChange"></address-dropdown>&ndash;&gt;-->
<!--                                </v-expansion-panel-content>-->
<!--                            </v-expansion-panel>-->
<!--                        </v-expansion-panels>-->
<!--                    </div>-->
                    <div class="to_address">
                        <label>{{$t('transfer.to')}}</label>
                        <qr-input v-model="addressIn" class="qrIn"></qr-input>
                    </div>


                    <div class="checkout">
                        <ul class="err_list" v-if="errors.length>0">
                            <li v-for="err in errors" :key="err">{{err}}</li>
                        </ul>
                        <v-btn depressed class="button_primary" color="#4C2E56" :loading="isAjax" :ripple="false" @click="formCheck" :disabled="!canSend" block>{{$t('transfer.send')}}</v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Ref } from 'vue-property-decorator';

    import TxList from "@/components/wallet/transfer/TxList.vue";
    import RadioButtons from "@/components/misc/RadioButtons.vue";
    import Big from "big.js";

    import NftList from "@/components/wallet/transfer/NftList.vue";

    //@ts-ignore
    import { QrInput } from "@avalabs/vue_components";
    import {avm, isValidAddress} from "../../AVA";
    import FaucetLink from "@/components/misc/FaucetLink.vue";
    import {ITransaction} from "@/components/wallet/transfer/types";
    import { UTXO } from "avalanche/dist/apis/avm";

    @Component({
        components: {
            FaucetLink,
            TxList,
            RadioButtons,
            QrInput,
            NftList
        }
    })
    export default class Transfer extends Vue{
        showAdvanced:boolean = false;
        isAjax:boolean = false;
        addressIn:string = '';
        orders:ITransaction[] = [];
        nftOrders: UTXO[] = [];
        errors:string[] = [];


        updateTxList(data:ITransaction[]){
            this.orders = data;
        }

        updateNftList(val: UTXO[]){
            this.nftOrders = val;
        }

        formCheck(){
            this.errors = [];
            let err = [];
            if(!isValidAddress(this.addressIn)){
                err.push('Invalid address.')
            }


            this.errors = err;
            if(err.length===0){
                this.send();
            }
        }

        send(){
            let parent = this;
            this.isAjax = true;

            // let sumArray: (ITransaction|UTXO)[] = this.orders.concat(this.nftOrders);
            let sumArray: (ITransaction|UTXO)[] = [...this.orders, ...this.nftOrders];

            let txList = {
                toAddress: this.addressIn,
                orders: sumArray
            };

            this.$store.dispatch('issueBatchTx', txList).then(res => {
                parent.isAjax = false;

                if(res === 'success'){
                    // Clear transactions list
                    // @ts-ignore
                    parent.$refs.txList.clear();

                    // Clear NFT list
                    if(this.hasNFT){
                        // @ts-ignore
                        parent.$refs.nftList.clear();
                    }

                    this.$store.dispatch('Notifications/add', {
                        title: 'Transaction Sent',
                        message: 'You have successfully sent your transaction.',
                        type:'success',
                    });
                }else{
                    this.$store.dispatch('Notifications/add', {
                        title: 'Error Sending Transaction',
                        message: 'Failed to send transaction.',
                        type:'error',
                    });
                }
            });
        }


        get networkStatus():string{
            let stat = this.$store.state.Network.status;
            return stat;
        }

        get hasNFT(): boolean{
            return this.$store.getters.walletNftUTXOs.length > 0;
        }

        get faucetLink(){
            let link = process.env.VUE_APP_FAUCET_LINK;
            if(link) return link;
            return null;
        }
        get canSend(){
            if(!this.addressIn) return false;

            if((this.orders.length > 0 && this.totalTxSize.eq(0)) && this.nftOrders.length===0 ){
                return false;
            }

            if(this.orders.length === 0 && this.nftOrders.length===0) return false;

            // if(((this.orders.length===0 || this.totalTxSize.eq(0)) || this.nftOrders.length>0))
            //
            // if(this.addressIn && ((this.orders.length>0 && this.totalTxSize.gt(0)) || this.nftOrders.length>0) ){
            //     return true;
            // }
            return true;
        }
        get totalTxSize(){
            let res = Big(0);
            for(var i=0; i<this.orders.length; i++){
                let order = this.orders[i];
                if(order.amount){
                    res = res.add(this.orders[i].amount);
                }
            }
            return res;
        }

        get txFee(): Big{
            let fee = avm.getFee();
            let res = Big(fee.toString()).div(Math.pow(10,9));
            return res;
        }

        get addresses(){
            return this.$store.state.addresses;
        }
    }
</script>


<style lang="scss">

    .advanced_panel{
        .v-expansion-panel-header{
            padding: 0;
            font-size: 12px;
            font-weight: normal;
            color: #2c3e50;
            min-height: auto !important;
            margin-bottom: 10px;
        }
        .v-expansion-panel-content__wrap{
            padding: 0 !important;
        }

        .v-icon{
            font-size: 12px;
        }
    }
</style>
<style scoped lang="scss">
    @use '../../main';

    $padLeft: 24px;
    $padTop: 8px;

    .disconnected{
        padding: 30px;
        text-align: center;
        background-color: var(--bg-light);
    }

    .explain{
        font-size: 12px;
        color: var(--primary-color-light);
    }
    h1{
        font-weight: normal;
    }
    h4{
        display: block;
        text-align: left;
        font-size: 16px;
        font-weight: bold;
        margin: 12px 0;
    }


    .send_to{
        display: flex;
        margin-bottom: 10px;
    }

    .addressIn >>> input{
        color: var(--bg) !important;
        padding: 5px 6px !important;
        text-align: center;
        letter-spacing: 2px;
        font-size: 12px;
    }

    .qrIn{
        border-radius: 2px !important;
        height: 40px;
        font-size: 12px;
        /*border: 1px solid #ddd;*/
        background-color: var(--bg-light) !important;
        color: var(--primary-color) !important;
    }

    .addressIn >>> input::-webkit-input-placeholder{
        color: var(--primary-color-light) !important;
    }

    .addressIn .v-input__slot:before{
        display: none;
    }

    .readerBut{
        margin-top: 4px;
        display: flex;
        background-color: #404040;
        /*cursor: pointer;*/
    }
    .readerBut button{
        opacity: 0.6;
        outline: none;
        padding: 6px 12px;
        margin: 0px auto;
    }
    .readerBut:hover button{
        opacity: 1;
    }


    .radio_buttons{
        margin-top: 15px;
    }



    .tx_info{
        text-align: left;
        font-size: 14px;
    }

    .new_order_Form{
        display: grid;
        grid-template-columns: 1fr 1fr 33%;
        column-gap: 45px;
        padding-top: 15px;
    }

    .new_order_Form > div{
        /*padding: 10px 0;*/
        margin-bottom: 15px;
    }
    .lists{
        padding-right: 45px;
        border-right: 1px solid var(--bg-light);
        grid-column: 1/3;
    }

    .tx_list{

    }

    .fees p{
        text-align: left;
        font-size: 13px;
        color: var(--primary-color-light);
    }

    .fees span{
        float: right;
    }

    .to_address {
        margin-top: main.$vertical-padding;
        border-top: 1px solid var(--bg-light);
        padding-top: main.$vertical-padding;
    }

    label{
        color: main.$primary-color-light;
        font-size: 12px;
        font-weight: bold;
    }

    .faucet{
        margin-top: 20px;
    }

    .advanced{
        padding: 20px 0px !important;
        margin-bottom: 20px;
    }


    /*.checkout .v-btn{*/
    /*    color: #fff;*/
    /*}*/
    .advanced .advancedBody{
        transition-duration: 0.2s;
    }


    .err_list{
        font-size: 12px;
        color: var(--error);
        margin: 6px 0;
    }

    @media only screen and (max-width: 600px) {
        .order_form{
            display: block;
        }
        .asset_select button{
            flex-grow: 1;
            word-break: break-word;
        }
    }

    @media only screen and (max-width: main.$mobile_width) {
        .transfer_card {
            display: block;
            grid-template-columns: none;
        }

        .but_primary{
            width: 100%;
        }

        .new_order_Form{
            display: block;
            grid-template-columns: none;
        }

        .tx_list{
            padding: 0;
            border: none;
        }
    }
</style>
