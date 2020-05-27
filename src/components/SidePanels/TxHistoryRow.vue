<template>
    <div class="tx_history_row">
        <div class="icons">
            <img v-for="url in icons" :src="url" :key="url">
        </div>
        <div>
            <p class="time">{{time.format('MMM DD, YYYY')}}</p>
            <p class="from">Received from X-adfknasdfASDNFwe</p>
        </div>
        <div class="utxos">
            <tx-history-utxo v-for="(amount, assetId) in valList" :key="assetId" :amount="amount" :asset-id="assetId"></tx-history-utxo>
        </div>
    </div>
</template>
<script>
    import moment from 'moment';
    import TxHistoryUtxo from "@/components/SidePanels/TxHistoryValue";
    import {getAssetIcon} from '@/helpers/helper';

    export default {
        components: {
            TxHistoryUtxo
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

                ins.forEach(inputUtxo => {
                    let out = inputUtxo.output;
                    let addrs = out.addresses;
                    let assetId = out.assetID;
                    let amt = out.amount;


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
        grid-template-columns: 40px 1fr max-content;
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

</style>
