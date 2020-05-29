<template>
    <div class="top_cards">
        <balance-card class="top_card balance_card"></balance-card>
        <address-card class="top_card addr_card"></address-card>
    </div>
</template>
<script>
    import CopyText from "../misc/CopyText";
    import QRModal from "../modals/QRModal";
    import PaperWallet from "../modals/PaperWallet";

    import BalanceCard from "./home/TopCards/BalanceCard";
    import AddressCard from "./home/TopCards/AddressCard";

    export default {
        components: {
            BalanceCard,
            AddressCard,
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
                return this.$store.state.Network.selectedNetwork.ip;
            },
            isUpdateBalance(){
                return this.$store.state.Assets.isUpdateBalance;
            },
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    .top_cards{
        display: grid;
        grid-template-columns: repeat(5,1fr);
        grid-gap: 15px;
    }
    .top_card{
        flex-grow: 1;
        color: #000;
        flex-shrink: 0;
        display: flex;
        background-color: #FFF;
        padding: 22px 20px;
        /*margin: 12px;*/
        /*padding: 10px 8px;*/
        overflow: hidden;
        border-radius: 5px;
        animation-name: fade;
        animation-duration: 0.6s;
        animation-timing-function: ease-out;
    }

    .balance_card{
        grid-column: 1/4;
    }

    .addr_card{
        grid-column: 4/6;
    }
    .card_left{
        background-color: #F4EFFF;
        flex-basis: 70px;
        flex-shrink: 0;
        padding: 15px;
        border-bottom-right-radius: 5px;

        img{
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            fill: #ddd;
        }
    }



    .card_right{
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 20px 18px;
        padding-bottom: 8px;
    }


    .top_card h4{
        /*font-size: 26px;*/
        color: #000;
        font-weight: bold;
        text-align: left;
    }
    .top_card p{
        word-break: break-all;
        text-align: left;
        flex-grow: 1;
        margin: 0;
        font-size: 14px;

        font-family: Inconsolata, monospace;
    }

    .balance{
        font-size: 24px !important;
        /*font-weight: bold;*/
        font-family: Rubik !important;
    }

    .top_card .buts{
        width: 100%;
        text-align: right;
    }
    .top_card .buts button{
        font-size: 18px;
        margin: 0px 18px;
        margin-right: 0px;
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
    @media only screen and (max-width: main.$mobile_width) {
        .top_cards{
            grid-template-columns: none;
            grid-template-rows: min-content;
        }

        .top_card{
            /*padding: ;*/
        }

        .balance_card{
            grid-column: unset;
        }

        .addr_card{
            grid-column: unset;
        }
    }

    @media only screen and (max-width: main.$width_m) {
        .top_cards{
            grid-template-columns: none;
            grid-template-rows: min-content;
            /*background-color: #42b983;*/
        }
        .balance_card{
            grid-column: unset;
        }

        .addr_card{
            grid-column: unset;
        }
    }

    /* The animation code */
    /*@keyframes fade {*/
    /*    from {*/
    /*        opacity: 0.0;*/
    /*    }*/
    /*    to {*/
    /*        opacity: 1;*/
    /*    }*/
    /*}*/
</style>
