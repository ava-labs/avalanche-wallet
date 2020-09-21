<template>
    <div>
        <div class="curr_in_drop">
            <div class="max_in_cont">
                <button class="max_but" @click="maxOut">MAX</button>
                <big-num-input ref="bigIn" @change="amount_in" class="bigIn" contenteditable="bigIn" :max="max_amount" :denomination="denomination" :step="stepSize" :placeholder="placeholder"></big-num-input>
            </div>
<!--            <dropdown :items="dropdown_values" class="dropdown" @change="drop_change" :initial="initial"></dropdown>-->
            <BalanceDropdown :disabled_assets="disabled_assets" v-model="asset_now"></BalanceDropdown>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Component, Prop, Emit, Watch} from 'vue-property-decorator';

    import BN from "bn.js";
    // import Big from 'big.js';
    import Dropdown from "@/components/misc/Dropdown.vue";
    // import BigNumInput from "@/components/misc/BigNumInput";

    // @ts-ignore
    import { BigNumInput } from '@avalabs/vue_components';
    import AvaAsset from "@/js/AvaAsset";
    import {ICurrencyInputDropdownValue} from "@/components/wallet/transfer/types";
    import {IWalletAssetsDict, IWalletBalanceDict} from "@/store/types";

    import BalanceDropdown from "@/components/misc/BalancePopup/BalanceDropdown.vue";
    import {avm} from "@/AVA";
    interface IDropdownValue {
        label: string,
        key: string,
        data: any,
        disabled: boolean
    }

    @Component({
        components: {
            Dropdown,
            BigNumInput,
            BalanceDropdown
        }
    })
    export default class CurrencyInputDropdown extends Vue{
        amount: BN = new BN(0);
        asset_now: AvaAsset = this.walletAssetsArray[0];

        @Prop({default: () => []}) disabled_assets!: AvaAsset[];
        @Prop({default: ''}) initial!: string;

        mounted(){
            if(this.isEmpty) return;
            if(this.initial){
                let initialAsset = this.walletAssetsDict[this.initial];
                this.drop_change(initialAsset);
            }else{
                this.drop_change(this.walletAssetsArray[0]);
            }
        }


        @Watch('asset_now')
        drop_change(val: AvaAsset){
            this.asset_now = val;
            this.amount_in(new BN(0));
        }


        get stepSize(){
            return new BN(1);
        }
        maxOut(){
            // @ts-ignore
            this.$refs.bigIn.maxout();
        }

        amount_in(val: BN){
            this.amount = val;
            this.onchange();
        }





        // onchange event for the Component
        @Emit('change')
        onchange(): ICurrencyInputDropdownValue{
            return {
                asset: this.asset_now,
                amount: this.amount
            }
        }

        // get placeholder(): string{
        //     let denom = this.denomination;
        //
        //     let res = '0';
        //     return res;
        // }


        get isEmpty():boolean{
            if(this.walletAssetsArray.length===0){
                return true;
            }else{
                return false;
            }
        }

        get display():string{
            return '';
        }

        get placeholder():string{
            if(this.isEmpty || !this.asset_now) return '0.00';
            let deno = this.asset_now.denomination;
            let res = '0';
            if(deno > 0){
                res += '.';
                for(var i=0;i<deno;i++){
                    res += '0';
                }
            }
            return res;
        }

        get denomination(): number{
            if(!this.asset_now) return 0;
            return this.asset_now.denomination;
        }


        // get disabledAssets(){
        //     let res = this.walletAssetsArray.filter(asset => {
        //         return this.dis
        //     })
        // }
        // get dropdown_values(){
        //     let res: IDropdownValue[] = [];
        //
        //     this.walletAssetsArray.forEach(asset => {
        //         let disabled= false;
        //         if(this.disabled_assets.includes(asset)){
        //             disabled = true;
        //         }
        //         res.push({
        //             label: `${asset.name} (${asset.symbol})`,
        //             key: asset.id,
        //             data: asset,
        //             disabled: disabled
        //         });
        //     });
        //     return res;
        // }

        get walletAssetsArray():AvaAsset[]{
            return this.$store.getters.walletAssetsArray;
        }

        get walletAssetsDict():IWalletAssetsDict{
            return this.$store.getters['walletAssetsDict'];
        }

        get max_amount(): null | BN{
            if(!this.asset_now) return null;

            let assetId = this.asset_now.id;
            let balance = this.walletAssetsDict[assetId];

            // Max amount is BALANCE - FEE
            if(this.asset_now.symbol === 'AVAX'){
                let fee = avm.getTxFee();
                // console.log(fee);
                if(fee.gte(balance.amount)){
                    return new BN(0);
                }else{
                    return balance.amount.sub(fee);
                }
            }

            if(balance.amount.isZero()) return null;
            return balance.amount;
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    $barH: 1px;

    .bigIn{
        width: 100%;
        /*background-color: #303030;*/
    }

    .max_in_cont{
        display: grid;
        grid-template-columns: 50px 1fr;
    }


    .curr_in_drop{
        display: grid;
        grid-template-columns: 1fr 140px;
        background-color: transparent;
        /*height: 35px;*/
        /*font-size: 12px;*/
        /*border: 1px solid #ddd;*/
        font-size: 12px;
        height: 40px;
        width: 100%;
        outline: none;
        text-align: right;
        column-gap: 10px;

        > *{
            background-color: var(--bg-light);
            border-radius: 2px;
        }
    }


    input{
        padding: 8px;
        flex-grow: 1;
        outline: none;
        text-align: right;
        flex-basis: 0px;
        width: 0px;
        color: var(--primary-color);
    }

    .max_but{
        font-size: 12px;
        text-decoration: underline;
        text-decoration-style: dashed;
        outline: none;
        padding-left: 8px;
    }

    .dropdown{
        /*flex-basis: 140px;*/
        width: 100%;
        /*border-left: 1px solid #d2d2d2;*/
    }


    @include main.mobile-device{
        .curr_in_drop{
            grid-template-columns: 1fr 70px;
        }
    }
</style>
