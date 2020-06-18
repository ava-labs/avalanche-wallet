<template>
    <div class="transfer_card">
        <h1>{{$t('transfer.title')}}</h1>
        <div class="card_body">
            <div v-if="assetArray.length===0">
                <p>{{$t('transfer.no_cash')}}</p>
                <faucet-link v-if="faucetLink" class="faucet"></faucet-link>
            </div>
            <div v-else class="new_order_Form">
                <tx-list class="tx_list" ref="txList" @change="updateTxList"></tx-list>
                <div>
                    <div class="fees">
                        <h4>{{$t('transfer.fees')}}</h4>
                        <p>{{$t('transfer.fee_tx')}} <span>0.000000000 AVA</span></p>
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
                    <div>
                        <label>{{$t('transfer.to')}}</label>
                        <qr-input v-model="addressIn" class="qrIn"></qr-input>
                    </div>


                    <div class="checkout">
                        <ul class="err_list" v-if="errors.length>0">
                            <li v-for="err in errors" :key="err">{{err}}</li>
                        </ul>
                        <v-btn depressed class="but_primary" color="#2960CD" :loading="isAjax" :ripple="false" @click="formCheck" :disabled="!canSend" block>{{$t('transfer.send')}}</v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import TxList from "@/components/wallet/transfer/TxList.vue";
    // import AddressDropdown from "@/components/misc/AddressDropdown/AddressDropdown";
    import RadioButtons from "@/components/misc/RadioButtons.vue";
    // import QRInput from "@/components/misc/QRInput";
    import { QrInput } from "@avalabs/vue_components";
    import {isValidAddress} from "../../../AVA";
    import FaucetLink from "@/components/misc/FaucetLink.vue";
    import {ITransaction} from "@/components/wallet/transfer/types";

    @Component({
        components: {
            FaucetLink,
            TxList,
            RadioButtons,
            QrInput
        }
    })
    export default class Transfer extends Vue{
        showAdvanced:boolean = false;
        isAjax:boolean = false;
        addressIn:string = '';
        orders:ITransaction[] = [];
        errors:string[] = [];
        // change_address:string = '';

        // changeAddressesChange(val){
        //     this.change_address = val;
        // }
        // toggleAdvanced(){
        //     this.showAdvanced = !this.showAdvanced;
        // },
        updateTxList(data:ITransaction[]){
            this.orders = data;
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

            let txList = {
                toAddress: this.addressIn,
                orders: this.orders
            };

            this.$store.dispatch('issueBatchTx', txList).then(res => {
                parent.isAjax = false;

                if(res === 'success'){
                    parent.$refs.txList.clear();

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


        get faucetLink(){
            let link = process.env.VUE_APP_FAUCET_LINK;
            if(link) return link;
            return null;
        }
        get canSend(){
            if(this.addressIn && this.orders.length>0 && this.totalTxSize>0){
                return true;
            }
            return false;
        }
        get totalTxSize(){
            let res = 0;
            for(var i=0; i<this.orders.length; i++){
                let order = this.orders[i];
                if(order.amount){
                    res += this.orders[i].amount;
                }
            }
            return res;
        }
        get selectedAddress(){
            return this.$store.state.selectedAddress;
        }
        get addresses(){
            return this.$store.state.addresses;
        }
        get assetArray(){
            return this.$store.state.Assets.assets;
        }
    }
    //
    // export default {
    //     components: {
    //         FaucetLink,
    //         // QRReader,
    //         TxList,
    //         // AddressDropdown,
    //         RadioButtons,
    //         QrInput
    //     },
    //     data(){
    //         return{
    //             showAdvanced: false,
    //             isAjax: false,
    //             addressIn: '',
    //             orders: [],
    //             errors: [],
    //             change_address: '',
    //         }
    //     },
    //     methods: {
    //         changeAddressesChange(val){
    //             this.change_address = val;
    //         },
    //         // toggleAdvanced(){
    //         //     this.showAdvanced = !this.showAdvanced;
    //         // },
    //         updateTxList(data){
    //             this.orders = data;
    //         },
    //         onQrRead(value){
    //             this.addressIn = value;
    //         },
    //         formCheck(){
    //             this.errors = [];
    //             let err = [];
    //             if(!isValidAddress(this.addressIn)){
    //                 err.push('Invalid address.')
    //             }
    //
    //
    //             this.errors = err;
    //             if(err.length===0){
    //                 this.send();
    //             }
    //         },
    //         send(){
    //             let parent = this;
    //             this.isAjax = true;
    //
    //             let txList = {
    //                 toAddress: this.addressIn,
    //                 orders: this.orders
    //             };
    //
    //             this.$store.dispatch('issueBatchTx', txList).then(res => {
    //                 parent.isAjax = false;
    //
    //                 if(res === 'success'){
    //                     parent.$refs.txList.clear();
    //                 }
    //             });
    //         }
    //     },
    //     computed: {
    //         faucetLink(){
    //             let link = process.env.VUE_APP_FAUCET_LINK;
    //             if(link) return link;
    //             return null;
    //         },
    //         canSend(){
    //             if(this.addressIn && this.orders.length>0 && this.totalTxSize>0 && this.change_address.length > 0){
    //                 return true;
    //             }
    //             return false;
    //         },
    //         totalTxSize(){
    //           let res = 0;
    //           for(var i=0; i<this.orders.length; i++){
    //               let order = this.orders[i];
    //               if(order.amount){
    //                   res += this.orders[i].amount;
    //               }
    //           }
    //           return res;
    //         },
    //         selectedAddress(){
    //             return this.$store.state.selectedAddress;
    //         },
    //         addresses(){
    //             return this.$store.state.addresses;
    //         },
    //         // assets(){
    //         //     return this.$store.getters['Assets/assetsArray'];
    //         //     // return this.$store.state.assets;
    //         // },
    //         assetArray(){
    //             return this.$store.state.Assets.assets;
    //         }
    //     },
    //     created() {
    //         this.change_address = this.selectedAddress;
    //     }
    // }
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
    @use '../../../main';

    $padLeft: 24px;
    $padTop: 8px;

    .transfer_card{

    }

    .card_body{
        /*display: grid;*/
        /*grid-template-columns: 1fr 1fr 1fr;*/
        /*column-gap: 15px;*/
    }

    .explain{
        font-size: 12px;
        color: #909090;
    }
    h1{
        font-weight: normal;
    }
    h4{
        display: block;
        text-align: left;
        font-size: 18px;
        font-weight: bold;
        /*margin-bottom: 8px;*/
    }


    .send_to{
        display: flex;
        margin-bottom: 10px;
    }

    .addressIn >>> input{
        color: #fff !important;
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
        background-color: #F5F6FA;
    }

    .addressIn >>> input::-webkit-input-placeholder{
        color: #909090 !important;
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

    .tx_list{
        padding-right: 45px;
        border-right: 1px solid #F5F6FA;
        grid-column: 1/3;
    }

    .fees p{
        text-align: left;
        font-size: 13px;
        color: #909090;
    }

    .fees span{
        float: right;
    }


    label{
        color: #2c3e50;
        font-size: 12px;
        font-weight: bold;
    }

    .faucet{
        margin-top: 20px;
    }

    .advanced{
        /*border-bottom: 1px solid #f2f2f2;*/
        padding: 20px 0px !important;
        margin-bottom: 20px;
    }


    .checkout .v-btn{
        color: #fff;
    }
    .advanced .advancedBody{
        transition-duration: 0.2s;
    }


    .err_list{
        font-size: 12px;
        color: #e03737;
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
