<template>
    <div class="tx_history_row">
        <div class="icons">
            <img v-for="url in icons" :src="url" :key="url">
        </div>
        <div>
            <p class="time">{{timeText}}</p>
            <div class="utxos">
                <tx-history-value v-for="(amount, assetId) in valList" :key="assetId" :amount="amount" :asset-id="assetId"></tx-history-value>
            </div>
        </div>
    </div>
</template>
<script>
    import moment from 'moment';
    import TxHistoryValue from "@/components/SidePanels/TxHistoryValue";
    import {getAssetIcon} from '@/helpers/helper';
    import BN from "bn.js";

    export default {
        components: {
            TxHistoryValue
        },
        props: {
            transaction: {
                type: Object,
                required: true
            }
        },
        computed: {
            assetsDict(){
                return this.$store.state.Assets.assetsDict;
            },
            time(){
                return moment(this.transaction.timestamp);
            },
            timeText(){
                let now = Date.now();
                let diff = now - this.transaction.timestamp;

                let dayMs = 1000*60*60*24;

                if(diff > dayMs){
                    return this.time.format('MMM DD, YYYY')
                }
                return this.time.fromNow();
            },

            valList(){
                let ins = this.inValues;
                let outs = this.outValues;

                let res = JSON.parse(JSON.stringify(outs));

                for(var assetId in ins){
                    // let outAmount = outs[assetId] || 0;
                    let inAmount = ins[assetId] || 0;

                    if(res[assetId]){
                        res[assetId] -= inAmount;
                    }else{
                        res[assetId] = -1 * inAmount;
                    }

                    // let diff = outAmount - inAmount;
                    // console.log(outAmount);
                    // console.log(inAmount);
                    // console.log(`Income: ${diff}`);
                }


                return res;
            },

            assetsList(){
                let myAddr = this.$store.state.selectedAddress;
                let inAssets = this.inAssets;
                let outAssets = this.outAssets;

                let inVals = this.inValues;
                let outVals = this.outValues;


                let res = {};

                // console.log(inVals, inAssets);

                // Checking for income
                for(var id in outVals){
                    let outVal = outVals[id];
                    let inVal = inVals[id];
                    let inAsset = inAssets[id];


                    let amount = 0;

                    if(inVal){
                        let diff = inVal - outVal;
                        amount = diff;

                        // Get froms

                        console.log(diff, inAsset.addresses);
                    }else{
                        // Asset Genesis
                        amount = outVal;
                    }
                }

                // Checking for loss
                for(id in inVals){
                    let outVal = outVals[id];
                    let inVal = inVals[id];
                    let inAsset = inAssets[id];


                    let amount = 0;

                    if(inVal){
                        let diff = inVal - outVal;
                        amount = diff;

                        // Get froms

                        console.log(diff, inAsset.addresses);
                    }else{
                        // Asset Genesis
                        amount = outVal;
                    }
                }


                return res;
            },

            inputTotals(){
                return this.transaction.inputTotals;
            },

            outputTotals(){
                return this.transaction.inputTotals;
            },
            // Which assets are input
            inAssets(){
                let myAddr = this.$store.state.selectedAddress;
                let addrRaw = myAddr.split('-')[1];
                let ins = this.transaction.inputs;
                let res = {}; // asset id -> value dict

                // if empty
                if(!ins){
                    return res;
                }

                // Order by ASSET ID
                /*
                    id: {
                        amount: BN
                        addresses: string[]
                    }

                 */


                ins.forEach(inputUtxo => {
                    let out = inputUtxo.output;
                    let addrs = out.addresses;
                    let assetId = out.assetID;
                    let amtBN = new BN(out.amount, 10);

                    if(res[assetId]){
                        let prevAddrs = res[assetId].addresses;

                        res[assetId].amount.iadd(amtBN);
                        res[assetId].addresses = new Set([...prevAddrs, ...addrs]);
                    }else{
                        res[assetId] = {
                            amount: amtBN,
                            addresses: new Set(addrs)
                        }
                    }
                });

                return res;
            },

            outAssets(){
                let myAddr = this.$store.state.selectedAddress;
                let addrRaw = myAddr.split('-')[1];
                let outs = this.transaction.outputs;
                let res = {}; // asset id -> value dict

                // if empty
                if(!outs){
                    return res;
                }

                // Order by ASSET ID
                /*
                    id: {
                        amount: BN
                        addresses: string[]
                    }

                 */


                outs.forEach(outputUtxo => {
                    let addrs = outputUtxo.addresses;
                    let assetId = outputUtxo.assetID;
                    let amtBN = new BN(outputUtxo.amount, 10);

                    if(res[assetId]){
                        let prevAddrs = res[assetId].addresses;

                        res[assetId].amount.iadd(amtBN);
                        res[assetId].addresses = new Set([...prevAddrs, ...addrs]);
                    }else{
                        res[assetId] = {
                            amount: amtBN,
                            addresses: new Set(addrs)
                        }
                    }
                });

                return res;
            },
            // What did I loose?
            inValues(){
                let myAddr = this.$store.state.selectedAddress;
                let addrRaw = myAddr.split('-')[1];
                let ins = this.transaction.inputs;
                let res = {}; // asset id -> value dict

                // if empty
                if(!ins){
                    return res;
                }

                // Order by ASSET ID
                /*
                    id: {
                        amount: BN
                        addresses: string[]
                    }

                 */

                let res2 = {};

                ins.forEach(inputUtxo => {
                    let out = inputUtxo.output;
                    let addrs = out.addresses;
                    let assetId = out.assetID;
                    let amt = out.amount;
                    let amtBN = new BN(out.amount, 10)

                    if(res2[assetId]){
                        res2[assetId].amount.iadd(amtBN);
                        res2[assetId].addresses.add(addrs);
                    }else{
                        res2[assetId] = {
                            amount: amtBN,
                            addresses: new Set(addrs)
                        }
                    }



                    if(addrs.includes(addrRaw)){
                        if(res[assetId]){
                            res[assetId] += parseInt(amt)
                        }else{
                            res[assetId] = parseInt(amt)
                        }
                    }
                });
                // console.log(res2);

                return res;
            },

            // what did I gain?
            outValues(){
                let myAddr = this.$store.state.selectedAddress;
                let addrRaw = myAddr.split('-')[1];
                let outs = this.transaction.outputs;
                let res = {}; // asset id -> value dict

                // if empty
                if(!outs){
                    return res;
                }

                outs.forEach(utxoOut => {
                   let addrs = utxoOut.addresses;
                   let assetId = utxoOut.assetID;
                   let amt = utxoOut.amount;

                   if(addrs.includes(addrRaw)){

                       if(res[assetId]){
                           res[assetId] += parseInt(amt)
                       }else{
                           res[assetId] = parseInt(amt)
                       }
                   }
                });

                return res;
            },



            icons(){

                // let ids = [];
                let urls = [];
                let outs = this.outValues;

                for(var assetId in outs){
                    // ids.push(assetId);
                    urls.push(getAssetIcon(assetId))
                }
                return urls;
            }
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    $income_color: #5ECB08;
    $outcome_color: #000;

    .icons{
        justify-self: center;
        img{
            width: 20px;
            height: 20px;
            object-fit: contain;
        }
    }

    .tx_history_row{
        padding: 14px 0px;
        /*padding-right: 0;*/
        display: grid;
        grid-template-columns: 40px 1fr;
        border-bottom: 1px solid #EAEDF4;

        > div{
            align-self: center;
            overflow: auto;
        }
    }

    .time{
        font-size: 16px;
    }

    .from{
        font-size: 12px;
        color: #909090;
        word-break: keep-all;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }


    @include main.medium-device {
        .icons{
            justify-self: left;
            img{
                width: 14px;
                height: 14px;
                object-fit: contain;
            }
        }


        .tx_history_row{
            padding: 8px 0px;
            grid-template-columns: 24px 1fr;
        }
        .time{
            font-size: 14px;
            text-align: right;
        }
    }

</style>
