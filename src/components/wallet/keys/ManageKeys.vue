<template>
    <div>
        <div class="cols">
            <div class="card_body">
                <h1>My Keys</h1>
                <my-keys></my-keys>
            </div>
            <div class="right_side">
                <div>
                    <h4>Add Key</h4>
                    <p class="explain">
                        Add additional private keys to use with your wallet.
                    </p>
                    <v-tabs color="#2960CD" height="30" active-class="tab_active" :grow="true">
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
                    <export-wallet></export-wallet>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import ExportWallet from "@/components/wallet/keys/ExportWallet.vue";
    import AddKeyFile from "@/components/wallet/keys/AddKeyFile.vue";
    import AddKeyString from "@/components/wallet/keys/AddKeyString.vue";
    import MyKeys from "@/components/wallet/keys/MyKeys.vue";

    @Component({
        components: {
            ExportWallet,
            AddKeyFile,
            AddKeyString,
            MyKeys
        }
    })
    export default class ManageKeys extends Vue{

    }
</script>
<style scoped lang="scss">
    @use '../../../main';

    .cols{
        display: grid;
        grid-template-columns: 1fr 360px;
        grid-gap: 45px;
    }


    .right_side{
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-row-gap: 30px;
        border-left: 1px solid #F5F6FA;
        padding-left: 45px;
    }
    p{
        margin: 0 !important;
    }


    h1{
        font-weight: lighter;
    }
    h4{
        font-size: 18px;
        font-weight: lighter;
    }

    .explain{
        font-size: 12px;
        color: #909090;
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
        /*border: 1px solid #999;*/
        /*margin-right: 8px;*/
        /*border-radius: 4px;*/
        font-size: 12px;
    }
    .tab_active{
        /*color: #2960CD;*/
        /*background-color: #d6e3ff !important;*/
        /*border-color: #2960CD !important;*/
    }


    @media only screen and (max-width: main.$mobile_width) {
       .cols{
           grid-template-columns: none;
           display: block;
       }



        .right_side{
            border: none !important;
            padding: 0 !important;
        }
    }

    @include main.medium-device{
        .cols{
            grid-template-columns: none;
            display: block;
        }

        .right_side{
            border: none !important;
            padding: 0 !important;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: none;
            column-gap: 15px;
        }

        h4{
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #F5F6FA;
        }
    }
</style>
<style lang="scss">
    .cols{
        .v-tabs-bar{
            margin: 15px 0px;
        }
    }


    /*.cols {*/
    /*    .v-tabs-bar{*/
    /*        margin: 15px 0px;*/
    /*    }*/
    /*    .v-tabs-slider-wrapper{*/
    /*        display: none;*/
    /*    }*/
    /*}*/
</style>
