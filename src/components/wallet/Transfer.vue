<template>
    <div class="transfer_card">
        <div class="card_body">
            <h1>{{$t('transfer.title')}}</h1>
            <div v-if="assetArray.length===0">
                <p>{{$t('transfer.no_cash')}}</p>
                <faucet-link v-if="faucetLink" class="faucet"></faucet-link>
            </div>
            <div v-else class="new_order_Form">
                <tx-list ref="txList" @change="updateTxList"></tx-list>
                <div>
                    <h4>{{$t('transfer.to')}}</h4>
                    <qr-input v-model="addressIn" class="qrIn"></qr-input>
                </div>

                <div class="advanced">
                    <v-expansion-panels accordion class="advanced_panel" flat>
                        <v-expansion-panel>
                            <v-expansion-panel-header>{{$t('transfer.advanced')}}</v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <label>{{$t('transfer.adv_change')}}</label>
                                <radio-buttons :default_val="selectedAddress" :value="addresses" @change="changeAddressesChange"></radio-buttons>
<!--                                <address-dropdown :default_val="selectedAddress" @change="changeAddressesChange"></address-dropdown>-->
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </div>
                <div class="fees">
                    <h4>{{$t('transfer.fees')}}</h4>
                    <p>{{$t('transfer.fee_tx')}} <span>0 AVA</span></p>
                </div>
                <div class="checkout">
                    <v-alert type="error" text outlined dense v-if="errors.length>0">
                        <ul>
                            <li v-for="err in errors" :key="err">{{err}}</li>
                        </ul>
                    </v-alert>
                    <v-btn depressed color="#000" :loading="isAjax" :ripple="false" @click="formCheck" :disabled="!canSend">{{$t('transfer.send')}}</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import TxList from "@/components/wallet/TxList";
    // import AddressDropdown from "@/components/misc/AddressDropdown/AddressDropdown";
    import RadioButtons from "@/components/misc/RadioButtons";
    // import QRInput from "@/components/misc/QRInput";
    import { QrInput } from "@avalabs/vue_components";
    import {isValidAddress} from "../../AVA";
    import FaucetLink from "@/components/misc/FaucetLink";

    export default {
        components: {
            FaucetLink,
            // QRReader,
            TxList,
            // AddressDropdown,
            RadioButtons,
            QrInput
        },
        data(){
            return{
                showAdvanced: false,
                isAjax: false,
                addressIn: '',
                orders: [],
                errors: [],
                change_address: '',
            }
        },
        methods: {
            changeAddressesChange(val){
                this.change_address = val;
            },
            // toggleAdvanced(){
            //     this.showAdvanced = !this.showAdvanced;
            // },
            updateTxList(data){
                this.orders = data;
            },
            onQrRead(value){
                this.addressIn = value;
            },
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
            },
            send(){
                let parent = this;
                this.isAjax = true;

                let txList = {
                    changeAddresses: [this.change_address],
                    toAddress: this.addressIn,
                    orders: this.orders
                };

                this.$store.dispatch('issueBatchTx', txList).then(res => {
                    parent.isAjax = false;

                    if(res === 'success'){
                        parent.$refs.txList.clear();
                    }
                });
            }
        },
        computed: {
            faucetLink(){
                let link = process.env.VUE_APP_FAUCET_LINK;
                if(link) return link;
                return null;
            },
            canSend(){
                if(this.addressIn && this.orders.length>0 && this.totalTxSize>0 && this.change_address.length > 0){
                    return true;
                }
                return false;
            },
            totalTxSize(){
              let res = 0;
              for(var i=0; i<this.orders.length; i++){
                  let order = this.orders[i];
                  if(order.amount){
                      res += this.orders[i].amount;
                  }
              }
              return res;
            },
            selectedAddress(){
                return this.$store.state.selectedAddress;
            },
            addresses(){
                return this.$store.state.addresses;
            },
            // assets(){
            //     return this.$store.getters['Assets/assetsArray'];
            //     // return this.$store.state.assets;
            // },
            assetArray(){
                return this.$store.getters['Assets/assetsArray'];
            }
        },
        created() {
            this.change_address = this.selectedAddress;
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
    $padLeft: 24px;
    $padTop: 8px;

    .transfer_card{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        column-gap: 15px;
    }

    .card_body{
        grid-column: 1/3;
    }


    h4{
        display: block;
        text-align: left;
        font-size: 12px;
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
        border-radius: 3px !important;
        height: 40px;
        font-size: 12px;
        border: 1px solid #ddd;
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

    @media only screen and (max-width: 600px) {
        .order_form{
            display: block;
        }
        .asset_select button{
            flex-grow: 1;
            word-break: break-word;
        }
    }

    .tx_info{
        text-align: left;
        font-size: 14px;
    }

    .new_order_Form{
        padding-top: 15px;
    }

    .new_order_Form > div{
        /*padding: 10px 0;*/
        margin-bottom: 15px;
    }

    .fees p{
        text-align: left;
        font-size: 13px;
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
        /*margin: 20px auto;*/
        margin-top: 20px;
    }

    .advanced{
        /*border-top: 1px solid #f2f2f2;*/
        border-bottom: 1px solid #f2f2f2;
        padding: 20px 0px !important;
    }



    /*.advanced .toggle{*/
    /*    width: 100%;*/
    /*    text-align: left;*/
    /*    font-size: 13px;*/
    /*}*/

    /*.advanced .toggle span{*/
    /*    float: right;*/
    /*}*/

    .checkout .v-btn{
        color: #fff;
    }
    .advanced .advancedBody{
        /*max-height: 0px;*/
        transition-duration: 0.2s;
        /*overflow: hidden;*/
    }

    /*.advanced[active] .advancedBody{*/
    /*    max-height: 500px;*/
    /*    overflow: unset;*/

    /*}*/
    /*.advanced[active] .toggle span{*/
    /*    transform: rotateZ(180deg);*/
    /*}*/
</style>
