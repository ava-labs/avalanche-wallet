<template>
    <div>
        <div>
            <label>Node ID</label>
            <p>{{nodeID}}</p>
        </div>
        <v-btn @click="submit" class="button_secondary" depressed :loading="isLoading">Submit</v-btn>
    </div>
</template>
<script lang="ts">
    import "reflect-metadata";
    import { Vue, Component, Prop } from "vue-property-decorator";
    import {BN} from "avalanche/dist";
    import AvaHdWallet from "@/js/AvaHdWallet";
    import {PlatformVMConstants} from "avalanche/dist/apis/platformvm";
    import Big from "big.js";

    @Component
    export default class ConfirmPage extends Vue{
        @Prop() nodeID!: string;
        @Prop() start!: string;
        @Prop() end!: string;
        @Prop() delegationFee!: number;
        @Prop() amount!: BN
        @Prop() rewardAddress?: string;

        isLoading = false;
        err = '';

        txId = '';
        isSuccess = false;

        get startDate(){
            return new Date(this.start);
        }

        get endDate(){
            return new Date(this.start);
        }

        async submit(){
            console.log("ADD VALIDATOR");

            let nodeId = this.nodeID;
            let startDate = new Date(this.startDate);
            let endDate = new Date(this.endDate);
            let stakeAmt = this.amount;
            let fee = this.delegationFee;
            let rewardAddr = this.rewardAddress;

            let wallet: AvaHdWallet = this.$store.state.activeWallet;
            try{
                this.isLoading = true;
                this.err = "";
                let txId = await wallet.validate(nodeId,stakeAmt,startDate,endDate,fee,rewardAddr);
                this.isLoading = false;
                this.onsuccess(txId);
            }catch(err){
                this.isLoading = false;
                this.onerror(err);
            }
        }

        onsuccess(txId: string){
            this.txId = txId;
            this.isSuccess = true;
            this.$store.dispatch('Notifications/add', {
                type: 'success',
                title: 'Validator Added',
                message: 'Your tokens are now used to validate the network and earn rewards.'
            })
        }

        onerror(err: any){
            let msg:string = err.message;

            if(msg.includes('startTime')){
                this.err = "Start date must be in the future and end date must be after start date."
            }else if(msg.includes('must be at least')){
                let minAmt = PlatformVMConstants.MINSTAKE;
                let big = Big(minAmt.toString()).div(Math.pow(10,9));

                this.err = `Stake amount must be at least ${big.toString()} AVAX`;
            }else{
                this.err = err.message;
            }
            this.$store.dispatch('Notifications/add', {
                type: 'error',
                title: 'Validation Failed',
                message: 'Failed to add validator.'
            })
        }

        cancel(){
            this.$emit('cancel');
        }
    }
</script>
