<template>
    <div class="transfer_card">
        <h4>Send Transaction</h4>
        <div class="card_body">
<!--            <div v-if="assetArray.length===0">-->
<!--                YOU HAVE NO ASSETS TO TRANSFER-->
<!--            </div>-->
            <div  class="new_order_Form">
                <p class="tx_info">Create a transaction by selecting assets from the dropdown list, and entering the amount to send.
                    To add more assets, click the <fa icon="plus"></fa> button.</p>
                <tx-list ref="txList" @change="updateTxList"></tx-list>



                <div class="advanced" :active="showAdvanced">
                    <button class="toggle" @click="toggleAdvanced">Advanced <span><fa icon="caret-down"></fa></span></button>
                    <div class="advancedBody">
                        <label>Change Addresses</label>
                        <address-dropdown :default_val="addresses" @change="changeAddressesChange" multiple></address-dropdown>
                    </div>
                </div>


                <div class="fees">
                    <label>Fees:</label>
                    <p>Transaction Fee <span>0 AVA</span></p>
                </div>



                <div class="checkout">
                    <label>Send to:</label>
                    <QRInput v-model="addressIn"></QRInput>
                    <v-btn block depressed color="#b2b2b2" :loading="isAjax" :ripple="false" @click="send" :disabled="!canSend">Send</v-btn>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    // import QRReader from '@/components/misc/QRReader';
    import TxList from "@/components/wallet/transfer/TxList";
    import AddressDropdown from "@/components/misc/AddressDropdown/AddressDropdown";
    import QRInput from "@/components/misc/QRInput";

    export default {
        components: {
            // QRReader,
            TxList,
            AddressDropdown,
            QRInput
        },
        data(){
            return{
                showAdvanced: false,
                isAjax: false,
                addressIn: '',
                orders: [],
                change_addresses: [],
            }
        },
        methods: {
            changeAddressesChange(val){
                this.change_addresses = val;
                console.log(val);
            },
            toggleAdvanced(){
                this.showAdvanced = !this.showAdvanced;
            },
            updateTxList(data){
                this.orders = data;
            },
            onQrRead(value){
                this.addressIn = value;
            },
            send(){
                let parent = this;
                this.isAjax = true;

                let txList = {
                    changeAddresses: this.change_addresses,
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
                if(this.addressIn && this.orders.length>0 && this.totalTxSize>0 && this.change_addresses.length > 0){
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
            addresses(){
                return this.$store.state.addresses;
            },
            assets(){
                return this.$store.getters.balance;
                // return this.$store.state.assets;
            },
            assetArray(){
                return this.$store.getters.balanceArray;
            }
        }
    }
</script>

<style scoped lang="scss">
    $padLeft: 15px;
    $padTop: 8px;

    .transfer_card{
        color: #ddd;
        padding: $padTop 0px;
    }
    .card_body{
        padding: 0px $padLeft;
    }

    h4{
        font-size: 25px;
        text-align: left;
        border-bottom: 1px solid #707070;
        margin-bottom: 6px;
        padding: 0px $padLeft;
    }

    label{
        display: block;
        text-align: left;
        font-size: 14px;
        font-weight: bold;
        margin-top: 12px;
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

    /*.new_order_Form{*/
    /*    padding: 10px;*/
    /*}*/

    .fees p{
        text-align: left;
        font-size: 13px;
    }

    .fees span{
        float: right;
    }




    .advanced .toggle{
        width: 100%;
        text-align: left;
        font-size: 13px;
    }

    .advanced .toggle span{
        float: right;
    }

    .advanced .advancedBody{
        max-height: 0px;
        transition-duration: 0.2s;
        overflow: hidden;
    }

    .advanced[active] .advancedBody{
        max-height: 500px;
        overflow: unset;

    }
    .advanced[active] .toggle span{
        transform: rotateZ(180deg);
    }
</style>