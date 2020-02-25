<template>
    <div>
        <h4><fa icon="sign-out-alt"></fa><br>Send</h4>
        <div v-if="assetArray.length===0">
            YOU HAVE NO ASSETS TO TRANSFER
        </div>
        <div class="new_order_Form" v-else>
            <p class="tx_info">Create a transaction by selecting assets from the dropdown list, and entering the amount to send.
                To add more assets, click the <fa icon="plus"></fa> button.</p>
            <label>Transaction:</label>
            <tx-list ref="txList" @change="updateTxList"></tx-list>

            <div class="fees">
                <label>Fees:</label>
                <p>Transaction Fee <span>10 AVA</span></p>
            </div>
            <div class="checkout">
                <label>Send to:</label>
                <div class="send_to">
                    <q-r-reader class="readerBut" @change="onQrRead">
                        <button><fa icon="camera"></fa></button>
                    </q-r-reader>
                    <v-text-field v-model="addressIn" class="addressIn" color="#d88383" placeholder="####" height="40" background-color="#404040" dense flat :loading="isAjax" hide-details></v-text-field>
                </div>
                <p>
                    {{errors}}
                </p>
                <v-btn block color="#d88383" :loading="isAjax" :ripple="false" @click="formCheck">Send</v-btn>
            </div>
        </div>
    </div>
</template>
<script>
    import QRReader from '@/components/misc/QRReader';
    import TxList from "@/components/wallet/transfer/TxList";
    import router from "@/router";
    import {isValidAddress} from "../../../AVA";


    export default {
        components: {
            QRReader,
            TxList
        },
        data(){
            return{
                isAjax: false,
                addressIn: '',
                orders: [],
                errors: [],
            }
        },
        mounted() {
            console.log("Mounted")
            console.log(isValidAddress('cyfgvjh'));
        },
        methods: {
            updateTxList(data){
                this.orders = data;
            },
            onQrRead(value){
                this.addressIn = value;
            },

            formCheck(){
                this.errors = [];
                let err = [];
                if(isValidAddress(this.addressIn)){
                    err.push('Invalid address.')
                }


                this.errors = err;
                // if(err.length===0){
                //     this.send();
                // }
            },
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
                   }
                });
            }
        },
        computed: {
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

<style scoped>
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
        padding: 10px;
    }

    .fees p{
        text-align: left;
        font-size: 13px;
    }

    .fees span{
        float: right;
    }
</style>