<template>
    <div class="balance_card">
        <div class="fungible_card">
            <div class="header">
                <div class="refresh">
                    <Spinner v-if="isUpdateBalance" class="spinner"></Spinner>
                    <button v-else @click="updateBalance"><fa icon="sync"></fa></button>
                </div>
                <h4>{{$t('top.title2')}}</h4>
                <template v-if="!isBreakdown">
                    <button class="breakdown_toggle" @click="toggleBreakdown"><fa icon="eye"></fa> Show Breakdown</button>
                </template>
                <template v-else>
                    <button class="breakdown_toggle" @click="toggleBreakdown"><fa icon="eye-slash"></fa> Hide Breakdown</button>
                </template>
            </div>
            <div class="balance_row">
                <p class="balance" data-cy="wallet_balance">{{balanceText}} AVAX</p>
            </div>
<!--            <button class="expand_but">Show Breakdown<fa icon="list-ol"></fa></button>-->
            <div class="alt_info">
                <div>
                    <template v-if="!isBreakdown">
                        <label>Available</label>
                        <p>{{unlockedText}} AVAX</p>
                    </template>
                    <template v-else>
                        <label>Available (X)</label>
                        <p>{{avmUnlocked | cleanAvaxBN}} AVAX</p>
                        <label>Available (P)</label>
                        <p>{{platformUnlocked | cleanAvaxBN}} AVAX</p>
                    </template>
                </div>
                <div>
                    <template v-if="!isBreakdown">
                        <label>Locked</label>
                        <p>{{balanceTextLocked}} AVAX</p>
                    </template>
                    <template v-else>
                        <label>Locked (X)</label>
                        <p>{{avmLocked | cleanAvaxBN}} AVAX</p>
                        <label>Locked (P)</label>
                        <p>{{platformLocked | cleanAvaxBN}} AVAX</p>
                        <label>Locked Stakeable (P)</label>
                        <p>{{platformLockedStakeable | cleanAvaxBN}} AVAX</p>
                    </template>


                </div>
<!--                <div>-->
<!--                    <label>P-Chain</label>-->
<!--                    <p>{{pBalanceText}} AVAX</p>-->
<!--                </div>-->
                <div>
                    <label>Staking</label>
                    <p>{{stakingText}} AVAX</p>
                </div>
            </div>
        </div>
        <NftCol class="nft_card"></NftCol>
<!--        <div class="where_info">-->
<!--            <v-alert type="info" text class="alert_cont">-->
<!--                <p style="font-size: 14px;">-->
<!--                    <b>I bought coins in the Token Sale. Where are my AVAX?</b>-->
<!--                    <br>-->
<!--                    This wallet is connected to the Avalanche <i>Everest test network</i>. Your purchase will appear in the wallet after the Avalanche <i>Mainnet</i> launch.-->
<!--                </p>-->
<!--            </v-alert>-->
<!--        </div>-->
    </div>
</template>
<script lang="ts">

    import 'reflect-metadata';
    import { Vue, Component, Prop, Ref, Watch} from 'vue-property-decorator';
    import AvaAsset from "@/js/AvaAsset";
    import AvaHdWallet from "@/js/wallets/AvaHdWallet";
    import Spinner from '@/components/misc/Spinner.vue';
    import NftCol from './NftCol.vue';
    import Tooltip from '@/components/misc/Tooltip.vue';

    import Big from 'big.js';
    import {BN} from "avalanche/dist";
    import {ONEAVAX} from "avalanche/dist/utils";

    @Component({
        components: {
            Spinner,
            NftCol,
            Tooltip
        },
        filters: {
            cleanAvaxBN(val: BN){
                let big = Big(val.toString()).div(Big(ONEAVAX.toString()))
                return big.toLocaleString();
            }
        }
    })
    export default class BalanceCard extends Vue {
        isBreakdown = false;

        updateBalance():void{
            this.$store.dispatch('Assets/updateUTXOs');
            this.$store.dispatch('History/updateTransactionHistory');
        }

        get ava_asset():AvaAsset|null{
            let ava = this.$store.getters['Assets/AssetAVA'];
            return ava;
        }


        toggleBreakdown(){
            this.isBreakdown = !this.isBreakdown;
        }


        get avmUnlocked(): BN{
            if(!this.ava_asset) return new BN(0);
            return this.ava_asset.amount;
        }

        get avmLocked(): BN{
            if(!this.ava_asset) return new BN(0);
            return this.ava_asset.amountLocked;
        }

        // should be unlocked (X+P), locked (X+P) and staked and lockedStakeable
        get balanceText():string{
            if(this.ava_asset !== null){
                let xUnlocked = this.avmUnlocked;
                let xLocked = this.avmLocked;
                let pUnlocked = this.platformUnlocked;
                let pLocked = this.platformLocked;
                let staked = this.stakingAmount;
                let lockedStakeable = this.platformLockedStakeable;

                let denom = this.ava_asset.denomination;

                let tot = xUnlocked.add(xLocked).add(pUnlocked).add(pLocked).add(staked).add(lockedStakeable);
                let bigTot = Big(tot.toString()).div(Math.pow(10,denom))
                if(bigTot.lt(Big('1000'))){
                    return bigTot.toString();
                }else{
                    return bigTot.toLocaleString(3);
                }
            }else{
                return '?'
            }
        }


        // Locked balance is the sum of locked AVAX tokens on X and P chain
        get balanceTextLocked():string{
            if(this.ava_asset !== null){
                let denom = this.ava_asset.denomination;
                let tot = this.platformLocked.add(this.platformLockedStakeable)
                // let otherLockedAmt = this.platformLocked.add(this.platformLockedStakeable)
                let pLocked = Big(tot.toString()).div(Math.pow(10,denom))
                let amt = this.ava_asset.getAmount(true);
                    amt = amt.add(pLocked);


                if(amt.lt(Big('0.0001'))){
                    return amt.toLocaleString(denom);
                }else{
                    return amt.toLocaleString(3);
                }
            }else{
                return '?'
            }
        }

        get platformUnlocked(): BN{
            return this.$store.getters.walletPlatformBalance;
        }

        get platformLocked(): BN{
            return this.$store.getters.walletPlatformBalanceLocked;
        }

        get platformLockedStakeable(): BN{
            return this.$store.getters.walletPlatformBalanceLockedStakeable;
        }

        get unlockedText(){
            if(this.ava_asset){
                let xUnlocked = this.ava_asset.amount;
                let pUnlocked = this.platformUnlocked;

                let tot = xUnlocked.add(pUnlocked);
                let amtBig = this.avaxBnToBigAmt(tot);
                if(amtBig.lt(Big('1'))){
                    return amtBig.toString();
                }else{
                    return amtBig.toLocaleString(3);
                }
            }else{
                return '?'
            }
        }


        avaxBnToBigAmt(val: BN): Big{
            return Big(val.toString()).div(Math.pow(10,9));
        }

        get pBalanceText(){
            if(!this.ava_asset) return  '?';

            let denom = this.ava_asset.denomination;
            let bal = this.platformUnlocked;
            let bigBal = Big(bal.toString())
                bigBal = bigBal.div(Math.pow(10,denom))

            if(bigBal.lt(Big('1'))){
                return bigBal.toLocaleString(9);
            }else{
                return bigBal.toLocaleString(3);
            }
        }

        get stakingAmount(): BN{
            return this.$store.getters.walletStakingBalance;
        }

        get stakingText(){
            let balance = this.stakingAmount;
            if(!balance) return '0';

            let denom = 9;
            let bigBal = Big(balance.toString())
                bigBal = bigBal.div(Math.pow(10,denom))

            if(bigBal.lt(Big('1'))){
                return bigBal.toString();
            }else{
                return bigBal.toLocaleString(3);
            }
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
        display: grid;
        grid-template-columns: 1fr 230px;
        column-gap: 20px;
    }

    .nft_card{
        border-left: 2px solid var(--bg-light);
    }
    .fungible_card{
        height: 100%;
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
            flex-grow: 1;
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
        font-size: 2.4em;
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

        .spinner{
            color: var(--primary-color) !important;
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
        column-gap: 0px;
        > div{
            position: relative;
            padding: 0 24px;
            border-right: 2px solid var(--bg-light);
            &:first-of-type{
                padding-left: 0;
            }
            &:last-of-type{
                border: none;
            }
        }

        label{
            font-size: 13px;
            color: main.$primary-color-light;
        }
    }



    .nft_card{
        padding-left: 20px;
    }


    .breakdown_toggle{
        color: var(--primary-color-light);
        font-size: 13px;
    }


    @include main.medium-device {
        .balance_card{
            display: block;
            //grid-template-columns: 1fr 120px;
        }

        .balance{
            font-size: 1.8rem !important;
        }

        .nft_col{
            display: none;
        }

        .alt_info{
            font-size: 13px
        }
    }


    @include main.mobile-device{
        .balance_card{
            grid-template-columns: none;
            display: block !important;
        }

        .nft_col{
            display: none;
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
            text-align: left;
        }
    }
</style>
