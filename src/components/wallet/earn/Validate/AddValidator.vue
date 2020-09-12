<template>
    <div>
        <div class="cols">
            <form @submit.prevent="">
                <transition-group name="fade" mode="out-in">
                    <div v-show="!isConfirm" key="form">
                        <div style="margin: 30px 0;">
                            <h4>Node ID</h4>
                            <input type="text" v-model="nodeId" style="width: 100%" label="NodeID-XXXXXXX">
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
                            <AvaxInput v-model="stakeAmt" :max="maxAmt" class="amt_in"></AvaxInput>
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
                    <ConfirmPage key="confirm" v-show="isConfirm" :node-i-d="nodeId" :start="formStart" :end="formEnd" :amount="formAmt" :delegation-fee="delegationFee" :reward-address="rewardIn" :reward-destination="rewardDestination"></ConfirmPage>
                </transition-group>
                <div>
                    <div class="summary" v-if="!isSuccess">
                        <div>
                            <label>Staking Duration *</label>
                            <p>{{durationText}}</p>
                        </div>
                        <div>
                            <label>Estimated Rewards</label>
                            <p>{{estimatedReward}} AVAX</p>
                        </div>
                        <div class="submit_box">
                            <label style="margin: 8px 0 !important;">* If it is your first time staking, start small. Staked tokens are locked until the end of the staking period.</label>
                            <p class="err">{{err}}</p>
                            <v-btn v-if="!isConfirm" @click="confirm" class="button_secondary" depressed :loading="isLoading" :disabled="!canSubmit" block>Confirm</v-btn>
                            <template v-else>
                                <v-btn @click="submit" class="button_secondary" depressed :loading="isLoading" block>Submit</v-btn>
                                <v-btn text @click="cancelConfirm" block style="color:var(--primary-color); margin-top: 20px;">Cancel</v-btn>
                            </template>
                        </div>
                    </div>
                    <div class="success_cont" v-else>
                        <p class="check"><fa icon="check-circle"></fa></p>
                        <h2>You are now validating.</h2>
                        <p>Your tokens are locked for staking. You will receive your locked tokens plus the rewards once your staking period is over.</p>
                    </div>
                </div>

            </form>
        </div>


    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import {Vue, Component, Prop, Watch} from "vue-property-decorator";
//@ts-ignore
import AvaxInput from "@/components/misc/AvaxInput.vue";
import {BN} from "avalanche";
import Big from 'big.js';
//@ts-ignore
import { QrInput } from "@avalabs/vue_components";
import {bintools, pChain} from "@/AVA";
import AvaHdWallet from "@/js/AvaHdWallet";
import ConfirmPage from "@/components/wallet/earn/Validate/ConfirmPage.vue";
import moment from "moment";
import {calculateStakingReward} from "@/helpers/helper";
import {ONEAVAX} from "avalanche/dist/utils";

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
    startDate: string = (new Date()).toISOString();
    endDate: string = "";
    delegationFee: string = '0.0';
    nodeId = "";
    rewardIn: string = "";
    rewardDestination = 'local'; // local || custom
    isLoading = false;
    isConfirm = false;
    err:string = "";
    stakeAmt: BN = new BN(0);

    formNodeId = "";
    formAmt: BN = new BN(0);
    formStart: Date = new Date(this.startDateMin);
    formEnd: Date = new Date(this.endDateMax);
    formFee: number = 0;
    formRewardAddr = "";

    txId = "";
    isSuccess = false;


    @Watch('delegationFee')
    onFeeChange(val: string){
        let num = parseFloat(val);
        if(num < 0){
            this.delegationFee = '0';
        }else if(num>100){
            this.delegationFee = '100';
        }
    }


    created(){
        this.startDate = this.startDateMin;
        this.endDate = this.endDateMin;
    }


    amount_in(val: BN){
        console.log("Stake val: ",val);
    }

    get rewardAddressLocal(){
        let wallet: AvaHdWallet = this.$store.state.activeWallet;
        return wallet.getPlatformRewardAddress();
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


    get estimatedReward(): string{
        let start = new Date(this.startDate);
        let end = new Date(this.endDate);
        let duration = end.getTime() - start.getTime(); // in ms
        // let durationYears = duration / (60000*60*24*365);
        //
        // let inflationRate = this.inflation;
        // let stakeAmt = Big(this.stakeAmt.toString()).div(Math.pow(10,9));

        let currentSupply = this.$store.state.Platform.currentSupply;
        let estimation = calculateStakingReward(this.stakeAmt,duration/1000, currentSupply);
        let res = Big(estimation.toString()).div(Math.pow(10,9));

        // let value = stakeAmt.times( Math.pow(inflationRate, durationYears));
        // value = value.sub(stakeAmt);

        return res.toLocaleString(2);
    }

    updateFormData(){
        this.formNodeId = this.nodeId;
        this.formAmt = this.stakeAmt;
        this.formStart = new Date(this.startDate);
        this.formEnd = new Date(this.endDate);
        this.formRewardAddr = this.rewardIn;
        this.formFee = parseFloat(this.delegationFee);
    }

    confirm(){
        if(!this.formCheck()) return;
        this.updateFormData();
        this.isConfirm = true;
    }
    cancelConfirm(){
        this.isConfirm = false;
    }

    get canSubmit(){
        if(!this.nodeId){
            return false;
        }

        if(this.stakeAmt.isZero()){
            return false;
        }

        if(!this.rewardIn){
            return false;
        }

        return true;
    }

    formCheck(): boolean{
        this.err = "";


        // Reward Address
        if(this.rewardDestination!=='local'){
            let rewardAddr = this.rewardIn;

            try{
                bintools.parseAddress(rewardAddr, 'P')
            }catch(e){
                this.err = "Invalid reward address."
                return false;
            }
        }

        return true;
    }

    async submit(){
        if(!this.formCheck()) return;
        let wallet: AvaHdWallet = this.$store.state.activeWallet;

        try{
            this.isLoading = true;
            this.err = "";
            let txId = await wallet.validate(this.formNodeId,this.formAmt,this.formStart,this.formEnd,this.formFee,this.formRewardAddr);
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

    get minStakeAmt(): BN{
        return this.$store.state.Platform.minStake;
    }

    onerror(err: any){
        let msg:string = err.message;

        if(msg.includes('startTime')){
            this.err = "Start date must be in the future and end date must be after start date."
        }else if(msg.includes('must be at least')){
            let minAmt = this.minStakeAmt;
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
@use "../../../../main";
.cols{
    /*display: grid;*/
    /*grid-template-columns: 1fr 1fr;*/
}


form{
    display: grid;
    grid-template-columns: 1fr 340px;
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

.submit_box{
    .v-btn{
        margin-top: 14px;
    }
}

.summary{
    border-left: 2px solid var(--bg-light);
    padding-left: 30px;
    > div{
        margin: 14px 0;
        p{
            font-size: 24px;
        }
    }

    .err{
        margin: 14px 0 !important;
        font-size: 14px;
    }
}

.success_cont{
    .check{
        font-size: 4em;
        color: var(--success);
    }
}

.amt_in{
    width: max-content;
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

@include main.mobile-device{
    form{
        grid-template-columns: 1fr;
    }

    .dates{
        grid-template-columns: 1fr;
    }

    .amt_in{
        width: 100%;
    }

    .summary{
        border-left: none;
        border-top: 2px solid var(--bg-light);
        padding-left: 0;
        padding-top: 30px;
    }
}
</style>
