<template>
    <div class="tx_history_row">
        <div class="icons">
            <img v-for="url in icons" :src="url" :key="url">
        </div>
        <div>
            <p class="time">
                {{timeText}}
                <a :href="explorerUrl" target="_blank" tooltip="View in Explorer" class="explorer_link"><fa icon="search"></fa></a>
            </p>
            <div class="utxos">
                <tx-history-value v-for="(amount, assetId) in valList" :key="assetId" :amount="amount" :asset-id="assetId" :is-income="false"></tx-history-value>
<!--                <tx-history-value v-for="(amount, assetId) in outValues" :key="assetId" :amount="amount" :asset-id="assetId" :is-income="true"></tx-history-value>-->
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata'
    import { Vue, Component, Prop } from 'vue-property-decorator'

    import moment from 'moment';
    import TxHistoryValue from "@/components/SidePanels/TxHistoryValue.vue";
    import {getAssetIcon} from '@/helpers/helper';
    import BN from "bn.js";
    import {ITransactionData} from "@/store/modules/history/types";
    import {TransactionValueDict} from "@/components/SidePanels/types";
    // import {AssetsDict} from "@/store/modules/assets/types";
    // import {AvaNetwork} from "@/js/AvaNetwork";
    import store from '@/store';
    import AvaHdWallet from "@/js/wallets/AvaHdWallet";
    import {LedgerWallet} from "@/js/wallets/LedgerWallet";


    @Component({
        components: {
            TxHistoryValue,
        }
    })
    export default class TxHistoryRow extends Vue {
        @Prop() transaction!: ITransactionData;


        get explorerUrl(): string{
            // TODO: Make this dynamic
            return `https://explorer.avax.network/tx/${this.transaction.id}`;
        }

        get time(){
            return moment(this.transaction.timestamp);
        }

        get timeText():string {
            let now = Date.now();
            let diff = now - new Date(this.transaction.timestamp).getTime();

            let dayMs = 1000*60*60*24;

            if(diff > dayMs){
                return this.time.format('MMM DD, YYYY')
            }
            return this.time.fromNow();
        }


        get valList(){
            let ins = this.inValues;
            let outs = this.outValues;

            let res = JSON.parse(JSON.stringify(outs));

            for(var assetId in ins){
                let inAmount = ins[assetId] || 0;
                if(res[assetId]){
                    res[assetId] -= inAmount;
                }else {
                    res[assetId] = -1 * inAmount;
                }
            }

            return res;
        }

        get addresses(){
            let wallet: AvaHdWallet|LedgerWallet = this.$store.state.activeWallet;
            if(!wallet) return [];

            return wallet.getHistoryAddresses();
        }

        // What did I loose?
        get inValues(){
            let addrs:string[] = this.addresses;
            let addrsRaw = addrs.map(addr => addr.split('-')[1]);

            let ins = this.transaction.inputs;
            let res:TransactionValueDict = {}; // asset id -> value dict

            // if empty
            if(!ins){
                return res;
            }

            ins.forEach(inputUtxo => {
                let out = inputUtxo.output;
                let utxoAddrs = out.addresses;
                let assetId = out.assetID;
                let amt = out.amount;
                let amtBN = new BN(out.amount, 10);

                let intersection =  utxoAddrs.filter(value => addrsRaw.includes(value));
                let isIncludes = intersection.length > 0;

                if(isIncludes){
                    if(res[assetId]){
                        res[assetId] += parseInt(amt)
                    }else{
                        res[assetId] = parseInt(amt)
                    }
                }
            });
            // console.log(res2);

            return res;
        }

        // what did I gain?
        get outValues(){
            let addrs:string[] = this.addresses;
            let addrsRaw = addrs.map(addr => addr.split('-')[1]);
            let outs = this.transaction.outputs;
            let res:TransactionValueDict = {}; // asset id -> value dict

            // if empty
            if(!outs){
                return res;
            }

            outs.forEach(utxoOut => {
                let utxoAddrs = utxoOut.addresses;
                let assetId = utxoOut.assetID;
                let amt = utxoOut.amount;

                let intersection =  utxoAddrs.filter(value => addrsRaw.includes(value));
                let isIncludes = intersection.length > 0;

                if(isIncludes){

                    if(res[assetId]){
                        res[assetId] += parseInt(amt)
                    }else{
                        res[assetId] = parseInt(amt)
                    }
                }
            });

            return res;
        }



        get icons(){

            // let ids = [];
            let urls = [];
            let outs = this.outValues;

            for(var assetId in outs){
                // ids.push(assetId);
                urls.push(getAssetIcon(assetId))
            }
            return urls.splice(0,1);
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

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

        > div{
            align-self: center;
            overflow: auto;
        }
    }

    .explorer_link{
        color: var(--primary-color-light);
    }

    .time{
        font-size: 16px;

        a{
            float: right;
            opacity: 0.4;
            font-size: 12px;

            &:hover{
                opacity: 0.8;
            }
        }
    }

    .from{
        font-size: 12px;
        color: var(--primary-color-light);
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
            text-align: left;
        }
    }

</style>
