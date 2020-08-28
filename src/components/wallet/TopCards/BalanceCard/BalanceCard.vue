<template>
    <div class="balance_card">
        <div class="fungible_card">
            <div class="header">
                <div class="refresh">
                    <Spinner v-if="isUpdateBalance" color="#000"></Spinner>
                    <button v-else @click="updateBalance"><fa icon="sync"></fa></button>
                </div>
                <h4>{{$t('top.title2')}}</h4>
            </div>
            <div class="balance_row">
                <p class="balance" data-cy="wallet_balance">{{balanceText}} AVAX</p>
            </div>
            <div class="alt_info">
<!--                <div>-->
<!--                    <label>Available</label>-->
<!--                    <p>{{balanceText}} AVA</p>-->
<!--                </div>-->
<!--                <div>-->
<!--                    <label>Shared</label>-->
<!--                    <p>- AVA</p>-->
<!--                </div>-->
                <div>
                    <label>P-Chain</label>
                    <p>{{pBalanceText}} AVAX</p>
                </div>
            </div>
        </div>
        <NftCol class="nft_card"></NftCol>
        <div class="where_info">
            <v-alert type="info" text class="alert_cont">
                <p style="font-size: 14px;">
                    <b>I bought coins in the Token Sale. Where are my AVAX?</b>
                    <br>
                    This wallet is connected to the Avalanche <i>Everest test network</i>. Your purchase will appear in the wallet after the Avalanche <i>Mainnet</i> launch.
                </p>
            </v-alert>
        </div>
    </div>
</template>
<script lang="ts">

    import 'reflect-metadata';
    import { Vue, Component, Prop, Ref, Watch} from 'vue-property-decorator';
    import AvaAsset from "@/js/AvaAsset";
    import AvaHdWallet from "@/js/AvaHdWallet";
    import Spinner from '@/components/misc/Spinner.vue';
    import NftCol from './NftCol.vue';

    import Big from 'big.js';
    import {BN} from "avalanche/dist";

    @Component({
        components: {
            Spinner,
            NftCol
        }
    })
    export default class BalanceCard extends Vue {
        updateBalance():void{
            this.$store.dispatch('Assets/updateUTXOs');
            this.$store.dispatch('History/updateTransactionHistory');
        }

        get ava_asset():AvaAsset|null{
            let ava = this.$store.getters['Assets/AssetAVA'];
            return ava;
        }

        get balanceText():string{
            if(this.ava_asset !== null){
                let amt = this.ava_asset.getAmount();
                if(amt.lt(Big('0.00001'))){
                    return amt.toLocaleString(this.ava_asset.denomination);
                }else{
                    return amt.toString();
                }
            }else{
                return '-'
            }
        }

        get platformUnlocked(): BN{
            return this.$store.getters.walletPlatformBalance;
        }

        get platformLocked(): BN{
            return this.$store.getters.walletPlatformBalanceLocked;
        }

        get pBalanceText(){
            if(!this.ava_asset) return  '?';

            let denom = this.ava_asset.denomination;
            let bal = this.platformUnlocked.add(this.platformLocked);
            let bigBal = Big(bal.toString())
                bigBal = bigBal.div(Math.pow(10,denom))
            return bigBal.toString();
        }

        get wallet():AvaHdWallet{
            return this.$store.state.activeWallet;
        }

        get isUpdateBalance():boolean{
            return this.$store.state.Assets.isUpdateBalance;
        }
    }
</script>
<style scoped lang="scss">
    @use '../../../../main';
    .balance_card{
        display: grid !important;
        grid-template-columns: 1fr 230px;
        column-gap: 20px;
    }

    .nft_card{
        border-left: 2px solid var(--bg-light);
    }
    .fungible_card{
        display: grid !important;
        grid-template-rows: max-content 1fr max-content;
        flex-direction: column;
    }

    .where_info{
        grid-row: 2;
        grid-column: 1/3;
        margin-top: 8px;
        /*max-width: 460px;*/
    }
    .header{
        display: flex;

        h4{
            margin-left: 12px;
        }
    }
    h4{
        font-weight: normal;
    }

    .alert_cont{
        margin: 0;
    }

    .balance_row{
        align-self: center;
    }
    .balance{
        font-size: 2.8em !important;
        white-space: normal;
        /*font-weight: bold;*/
        font-family: Rubik !important;
    }

    .refresh{
        width: 20px;
        height: 20px;
        color: var(--primary-color);

        img{
            object-fit: contain;
            width: 100%;
        }
    }
    .buts{
        width: 100%;
        text-align: right;
    }
    .buts button{
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

    .alt_info{
        display: grid;
        grid-template-columns: repeat(3, max-content);
        column-gap: 10px;
        > div{
            padding-right: 30px;
            border-right: 2px solid var(--bg-light);
            &:last-of-type{
                border: none;
            }
        }

        label{
            font-size: 12px;
            color: main.$primary-color-light;
        }
    }



    .nft_card{
        padding-left: 20px;
    }


    @include main.mobile-device{
        .balance_card{
            grid-template-columns: none;
            display: block !important;
        }

        .nft_card{
            padding: 0;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--primary-color-light);
            border-left: none;
        }

        .balance{
            font-size: 2em !important;
        }

        .where_info{}

        .alt_info{
            display: none;
            grid-template-columns: none;
            text-align: left;

            >div{
                padding: 0;
                border: none;
            }
        }
    }
</style>
