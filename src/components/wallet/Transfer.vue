<template>
    <div class="transfer_card">
        <h2>{{$t('transfer.title')}}</h2>
        <div class="card_body">
            <div v-if="assetArray.length===0">
                <p>{{$t('transfer.no_cash')}}</p>
                <h4>{{$t('transfer.faucet')}} <fa icon="tint"></fa></h4>
                <a href="https://github.com/ava-labs/faucet-site" target="_blank">Go to faucet.</a>
            </div>
            <div  v-else class="new_order_Form">
                <tx-list ref="txList" @change="updateTxList"></tx-list>
                <div>
                    <h4>{{$t('transfer.to')}}</h4>
                    <qr-input v-model="addressIn"></qr-input>
                </div>
                <div class="fees">
                    <h4>{{$t('transfer.fees')}}</h4>
                    <p>{{$t('transfer.fee_tx')}} <span>0 AVA</span></p>
                </div>
                <div class="advanced">
                    <h4>{{$t('transfer.advanced')}}</h4>
                    <div class="advancedBody">
                        <label>{{$t('transfer.adv_change')}}</label>
                        <address-dropdown :default_val="selectedAddress" @change="changeAddressesChange"></address-dropdown>
                    </div>
                </div>
                <div class="checkout">
                    <v-alert type="error" text dense v-if="errors.length>0">
                        <ul>
                            <li v-for="err in errors" :key="err">{{err}}</li>
                        </ul>
                    </v-alert>
                    <v-btn block depressed color="#61c394" :loading="isAjax" :ripple="false" @click="formCheck" :disabled="!canSend">{{$t('transfer.send')}}</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import TxList from "@/components/wallet/TxList";
    import AddressDropdown from "@/components/misc/AddressDropdown/AddressDropdown";
    // import QRInput from "@/components/misc/QRInput";
    import { QrInput } from "@avalabs/vue_components";
    import {isValidAddress} from "../../AVA";

    export default {
        components: {
            // QRReader,
            TxList,
            AddressDropdown,
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
                console.log(val);
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
        }
    }
</script>

<style scoped lang="scss">
    $padLeft: 24px;
    $padTop: 8px;

    .transfer_card{
        color: #222;
    }



    h4{
        display: block;
        text-align: left;
        font-size: 17px;
        font-weight: bold;
        margin-bottom: 8px;
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
        font-size: 14px;
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
        padding: 10px 0;
    }

    .fees p{
        text-align: left;
        font-size: 13px;
    }

    .fees span{
        float: right;
    }


    label{
        font-size: 12px;
        font-weight: bold;
    }


    .advanced{
        border-top: 1px solid #f2f2f2;
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