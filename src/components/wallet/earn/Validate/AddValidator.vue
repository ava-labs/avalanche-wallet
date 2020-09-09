<template>
    <div>
        <div class="cols" v-if="!isSuccess">
            <form @submit.prevent="" v-if="!isConfirm">
                <div>
                    <div style="margin: 30px 0;">
                        <h4>Node ID</h4>
                        <v-text-field label="Node ID" v-model="nodeId" hide-details filled flat></v-text-field>
                    </div>
                    <div style="margin: 30px 0;">
                        <h4>Staking Period</h4>
                        <p class="desc">The duration in which your tokens will be locked for staking.</p>
                        <div class="dates">
                            <div>
                                <label>Start Date & Time</label>
                                <datetime v-model="startDate" type="datetime" :min-datetime="startDateMin" :max-datetime="startDateMax"></datetime>
                            </div>
                            <div>
                                <label>End Date & Time</label>
                                <datetime v-model="endDate" type="datetime" :min-datetime="endDateMin" :max-datetime="endDateMax"></datetime>
                            </div>
                        </div>
                    </div>
                    <div style="margin: 30px 0;">
                        <h4>Stake Amount</h4>
                        <p class="desc">The amount of AVAX to lock for staking.</p>
                        <AvaxInput v-model="stakeAmt" :max="maxAmt"></AvaxInput>
                    </div>
                    <div style="margin: 30px 0;">
                        <h4>Delegation Fee</h4>
                        <p class="desc">You will claim this % of the rewards from the delegators on your node.</p>
                        <input type="number" min="0" max="100" step="0.1" v-model="delegationFee">
                    </div>
                    <div class="reward_in" style="margin: 30px 0;" :type="rewardDestination">
                        <h4>Reward Address</h4>
                        <p class="desc">Where to send the staking rewards.</p>
                        <v-chip-group mandatory @change="rewardSelect">
                            <v-chip small value="local">Use this wallet</v-chip>
                            <v-chip small value="custom">Custom Address</v-chip>
                        </v-chip-group>
                        <QrInput style="height: 40px; border-radius: 2px;" v-model="rewardIn" placeholder="Reward Address" class="reward_addr_in"></QrInput>
                    </div>
                </div>
                <div class="summary">
                    <div>
                        <label>Staking Duration</label>
                        <p>{{durationText}}</p>
                    </div>
                    <div>
                        <label>Estimated Rewards ({{((inflation-1)*100).toFixed(1)}}% Inflation)</label>
                        <p>{{estimatedReward}} AVAX</p>
                    </div>
                    <div style="margin: 30px 0;">
                        <p class="err">{{err}}</p>
                        <v-btn @click="submit" class="button_secondary" depressed :loading="isLoading" :disabled="!canSubmit">Submit</v-btn>
                    </div>
                </div>
            </form>
            <ConfirmPage v-else-if="isConfirm" :node-i-d="nodeId" :start="startDate" :end="endDate" :amount="stakeAmt" :delegation-fee="delegationFee"></ConfirmPage>
        </div>
        <div class="success_cont" v-else>
            <h2>You are now validating.</h2>
            <p>Your tokens are locked for staking. You will receive your locked tokens plus the rewards once your staking period is over</p>

            <div>
                <label>Node ID</label>
                <p>{{nodeId}}</p>
                <label>Stake Amount</label>
                <p>{{nodeId}}</p>
            </div>
        </div>

    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
//@ts-ignore
import AvaxInput from "@/components/misc/AvaxInput.vue";
import {BN} from "avalanche";
import Big from 'big.js';
//@ts-ignore
import { QrInput } from "@avalabs/vue_components";
import {bintools, pChain} from "@/AVA";
import AvaHdWallet from "@/js/AvaHdWallet";
import {PlatformVMConstants} from "avalanche/dist/apis/platformvm";
import ConfirmPage from "@/components/wallet/earn/Validate/ConfirmPage.vue";
import moment from "moment";

let dayMs = 1000 * 60 * 60 * 24;
@Component({
    name: "add_validator",
    components: {
        AvaxInput,
        QrInput,
        ConfirmPage
    }
})
export default class AddValidator extends Vue{
    startDate: string = "";
    endDate: string = "";
    delegationFee: number = 3.0;
    nodeId = "";
    rewardIn: string = "";
    rewardDestination = 'local'; // local || custom
    isLoading = false;
    isConfirm = false;
    err:string = "";
    stakeAmt: BN = new BN(0);

    txId = "";
    isSuccess = false;

    created(){
        this.startDate = this.startDateMin;
        this.endDate = this.endDateMin;
    }


    amount_in(val: BN){
        console.log("Stake val: ",val);
    }

    get rewardAddressLocal(){
        let wallet: AvaHdWallet = this.$store.state.activeWallet;
        return wallet.platformHelper.getCurrentAddress();
    }

    rewardSelect(val: 'local'|'custom'){
        if(val==='local'){
            this.rewardIn = this.rewardAddressLocal;
        }else{
            this.rewardIn = "";
        }
        this.rewardDestination = val;
    }

    // 5 minutes from now
    get startDateMin(){
        let now = Date.now();
        let res = now + (60000 * 5);

        return (new Date(res)).toISOString();
    }

    // 1 year
    get startDateMax(){
        let startDate = new Date();
        // add a year
        let endTime = startDate.getTime() + (60000*60*24*365);
        let endDate = new Date(endTime);
        return endDate.toISOString();
    }

    // Start date + 24 hours
    get endDateMin(){
        let start = this.startDate;
        let startDate = new Date(start);

        let end = startDate.getTime() + (60000*60*24);
        let endDate = new Date(end);
        return endDate.toISOString();
    }

    // Start date + 1 year
    get endDateMax(){
        let start = this.startDate;
        let startDate = new Date(start);

        let end = startDate.getTime() + (60000*60*24*365);
        let endDate = new Date(end);
        return endDate.toISOString();
    }


    get stakeDuration(): number{
        let start = new Date(this.startDate);
        let end = new Date(this.endDate);
        let diff = end.getTime() - start.getTime();
        return diff;
    }

    get durationText(){
        let d = moment.duration(this.stakeDuration, 'milliseconds');
        let days = Math.floor(d.asDays());
        return `${days} days ${d.hours()} hours ${d.minutes()} minutes`;
    }

    get stakeAmtText(){
        let amt = this.stakeAmt;
        let big = Big(amt.toString()).div(Math.pow(10,9));
        return big.toLocaleString(2);
    }

    get dateMax(){
        let dateMs = Date.now() + dayMs*364;
        let date = new Date(dateMs);
        console.log(date);
        return date.toISOString();
    }

    get dateMin(){
        let dateMs = Date.now();
        let date = new Date(dateMs);

        return date.toISOString();
    }

    get denomination(){
        return 9;
    }

    get platformUnlocked(): BN{
        return this.$store.getters.walletPlatformBalance;
    }

    get feeAmt(): BN{
        return pChain.getFee();
    }

    get maxAmt(): BN{
        let pAmt = this.platformUnlocked;
        let fee = this.feeAmt;

        let res = pAmt.sub(fee);
        const ZERO = new BN('0');

        if(res.gt(ZERO)){
            return res;
        }else{
            return ZERO;
        }
    }

    get inflation(): number{
        return 1.12;
    }

    get estimatedReward(): string{
        let start = new Date(this.startDate);
        let end = new Date(this.endDate);
        let duration = end.getTime() - start.getTime(); // in ms
        let durationYears = duration / (60000*60*24*365);

        let inflationRate = this.inflation;
        let stakeAmt = Big(this.stakeAmt.toString()).div(Math.pow(10,9));

        let value = stakeAmt.times( Math.pow(inflationRate, durationYears));
        value = value.sub(stakeAmt);

        return value.toLocaleString(2);
    }

    // confirm(){
    //     this.isConfirm = true;
    // }

    get canSubmit(){
        if(!this.nodeId){
            return false;
        }

        if(this.stakeAmt.isZero()){
            return false;
        }

        return true;
    }

    formCheck(): boolean{
        this.err = "";

        

        return true;
    }

    async submit(){
        if(!this.formCheck()) return;

        let nodeId = this.nodeId;
        let startDate = new Date(this.startDate);
        let endDate = new Date(this.endDate);
        let stakeAmt = this.stakeAmt;
        let fee = this.delegationFee;
        let rewardAddr = undefined;

        if(this.rewardDestination === 'custom'){
            rewardAddr = this.rewardIn;
        }
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
        }else if(msg.includes('nodeID')){
            this.err = "Invalid Node ID. Must start with \"NodeID-\"";
        }else if(msg.includes('address format')){
            this.err = "Invalid reward address.";
        }else{
            this.err = err.message;
        }
        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Validation Failed',
            message: 'Failed to add validator.'
        })
    }

}
</script>
<style scoped lang="scss">
.cols{
    /*display: grid;*/
    /*grid-template-columns: 1fr 1fr;*/
}


form{
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 90px;
}

.amt{
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px solid #999;
    padding: 4px 14px;
}
.bigIn{
    flex-grow: 1;

}

input{
    color: var(--primary-color);
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.desc{
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
}

h4{
    margin: 14px 0px 4px;
    font-weight: bold;
}

label{
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

.dates{
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;
}

.summary{
    > div{
        margin: 14px 0;
        p{
            font-size: 24px;
        }
    }

    .err{
        font-size: 14px;
    }
}

.success_cont{

}

.reward_in{
    transition-duration: 0.2s;
    &[type="local"]{
        .reward_addr_in{
            opacity: 0.3;
            user-select: none;
            pointer-events: none;
        }
    }
}
</style>
