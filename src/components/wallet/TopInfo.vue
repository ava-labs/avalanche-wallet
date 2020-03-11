<template>
    <div class="top_cards">
        <q-r-modal ref="qr_modal"></q-r-modal>
<!--        <addresses-modal ref="addresses_modal"></addresses-modal>-->
<!--        <key-store ref="keystore_modal"></key-store>-->
        <paper-wallet ref="print_modal"></paper-wallet>

        <div class="top_card" :style="{backgroundColor: '#6c79a7'}">
            <div class="card_left">
                <img src="/img/center_focus.png">
            </div>
            <div class="card_right">
                <h4>{{$t('top.title1')}}</h4>
                <p>{{address}}</p>
                <div class="buts">
                    <button :tooltip="$t('top.hover1')" @click="viewQRModal"><fa icon="qrcode"></fa></button>
<!--                    <button tooltip="My Addresses" @click="viewAddressesModal"><fa icon="list"></fa></button>-->
                    <button :tooltip="$t('top.hover2')" @click="viewPrintModal"><fa icon="print"></fa></button>
<!--                    <button tooltip="Download Keystore File" @click="viewKeystoreModal"><fa icon="download"></fa></button>-->
                    <CopyText :tooltip="$t('top.hover3')" :value="address"></CopyText>
                </div>
            </div>
        </div>
        <div class="top_card nonessential" :style="{backgroundColor: '#6ca7a7'}">
            <div class="card_left">
                <img src="/img/account-balance.png">
            </div>
            <div class="card_right">
                <h4>{{$t('top.title2')}}</h4>
                <p v-if="ava_asset">{{ava_asset.toString()}} AVA</p>
                <p v-else>0 AVA</p>
                <div class="buts">
                    <img v-if="isUpdateBalance" src="/gif/loading_2.gif">
                    <button v-else @click="updateBalance"><fa icon="sync"></fa></button>
                </div>
            </div>
        </div>
        <div class="top_card nonessential" :style="{backgroundColor: '#6ca77e'}">
            <div class="card_left">
                <img src="/img/wifi.png">
            </div>
            <div class="card_right">
                <h4>{{$t('top.title3')}}</h4>
                <p>{{network}}</p>
            </div>
        </div>
    </div>
</template>
<script>
    import CopyText from "../misc/CopyText";
    import QRModal from "../modals/QRModal";
    // import KeyStore from "../modals/KeyStore";
    import PaperWallet from "../modals/PaperWallet";
    // import AddressesModal from "../modals/AddressesModal";

    export default {
        components: {
            CopyText,
            PaperWallet,
            QRModal,
            // KeyStore,
            // AddressesModal
        },
        methods: {
            viewQRModal(){
                this.$refs.qr_modal.open();
            },
            viewPrintModal(){
                this.$refs.print_modal.open();
            },
            viewKeystoreModal(){
                this.$refs.keystore_modal.open();
            },
            viewAddressesModal(){
                this.$refs.addresses_modal.open();
            },
            updateBalance(){
                this.$store.dispatch('Assets/updateUTXOs');
            }
        },
        computed: {
            ava_asset(){
                return this.$store.getters['Assets/AssetAVA'];
            },
            address(){
                return this.$store.state.selectedAddress;
            },
            network(){
                return process.env.VUE_APP_AVA_IP;
            },
            isUpdateBalance(){
                return this.$store.state.Assets.isUpdateBalance;
            },
        }
    }
</script>
<style scoped>
    .top_cards{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 15px;
    }
    .top_card{
        flex-grow: 1;
        color: #fff;
        flex-shrink: 0;
        display: flex;
        background-color: #6ca771;
        /*margin: 12px;*/
        padding: 10px 8px;
        border-radius: 5px;
    }

    .card_left{
        flex-basis: 70px;
        flex-shrink: 0;
    }

    .card_right{
        display: flex;
        flex-direction: column;
        padding: 0px 18px;
    }

    .card_left img{
        width: 100%;
        object-fit: contain;
        fill: #ddd;
    }
    .top_card h4{
        font-size: 26px;
        text-align: left;
    }
    .top_card p{
        word-break: break-all;
        text-align: left;
        flex-grow: 1;
        margin: 0;
        font-size: 15px;
    }

    .top_card .buts{
        text-align: left;
    }
    .top_card .buts button{
        font-size: 22px;
        margin: 0px 18px;
        margin-left: 0px;
        position: relative;
        outline: none;
    }

    .buts img{
        height: 20px;
        width: 20px;
        object-fit: contain;
    }
    .buts button[tooltip]:hover:before{
        border-radius: 4px;
        /*left: 0;*/
        left: 0;
        transform: translateX(-50%);
        content: attr(tooltip);
        position: absolute;
        background-color: #303030;
        bottom: 100%;
        color: #ddd;
        width: max-content;
        max-width: 100px;
        font-size: 14px;
        padding: 4px 8px;
    }


    /*@media only screen and (max-width: 1200px) {*/
    /*    .top_cards {*/
    /*        grid-template-columns: 100%;*/
    /*        grid-template-rows: min-content min-content min-content;*/
    /*    }*/
    /*}*/
    @media only screen and (max-width: 600px) {
        .top_cards{
            grid-template-columns: 100%;
            grid-template-rows: min-content;
        }
        .top_card.nonessential{
            display: none;
        }
    }
</style>