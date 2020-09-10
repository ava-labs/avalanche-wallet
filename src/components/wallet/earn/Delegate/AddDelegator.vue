<template>
    <div>
        <div v-if="!selected">
            <div style="display: flex; align-items: center">
                <p>Select a node to delegate:</p>
                <input class="search" type="text" placeholder="Search Node ID" v-model="search">
            </div>
            <ValidatorsList class="val_list" :search="search" @select="onselect"></ValidatorsList>
        </div>
        <div class="cols" v-else>
            <transition-group name="fade" mode="out-in">
                <div class="ins_col" key="form" v-show="!isConfirm">
                    <div>
                        <div class="selected">
                            <button @click="selected = null">
                                <fa icon="times"></fa>
                            </button>
                            <div>
                                <p style="font-size: 13px; color: var(--primary-color-light)">Selected Node</p>
                                <p class="node_id">{{selected.nodeID}}</p>
                            </div>
                        </div>
                        <div style="margin: 30px 0;">
                            <h4>Staking Period</h4>
                            <p class="desc">The duration in which your tokens will be locked for staking.</p>
                            <div class="dates">
                                <div>
                                    <label>Start Date & Time</label>
                                    <datetime v-model="startDate" type="datetime" :min-datetime="startMinDate" :max-datetime="startMaxDate"></datetime>
                                </div>
                                <div>
                                    <label>End Date & Time</label>
                                    <datetime v-model="endDate" type="datetime" :min-datetime="endMinDate" :max-datetime="endMaxDate"></datetime>
                                </div>

                            </div>
                        </div>
                        <div style="margin: 30px 0;">
                            <h4>Stake Amount</h4>
                            <p class="desc">The amount of AVAX to lock for staking.</p>
                            <AvaxInput v-model="stakeAmt" :max="maxAmt" class="amt_in"></AvaxInput>
                        </div>
                        <div class="reward_in" style="margin: 30px 0;"  :type="rewardDestination">
                            <h4>Reward Address</h4>
                            <p class="desc">Where to send the staking rewards.</p>
                            <v-chip-group mandatory @change="rewardSelect">
                                <v-chip small value="local">Use this wallet</v-chip>
                                <v-chip small value="custom">Custom Address</v-chip>
                            </v-chip-group>
                            <QrInput  v-model="rewardIn" placeholder="Reward Address" class="reward_addr_in"></QrInput>
                        </div>
                    </div>
                </div>
                <ConfirmPage v-show="isConfirm" key="confirm" :start="startDate" :end="endDate" :amount="stakeAmt" :reward-destination="rewardDestination" :reward-address="rewardIn" :node-i-d="selected.nodeID"></ConfirmPage>
            </transition-group>
            <div>
                <div v-if="!isSuccess" class="summary">
                    <div>
                        <label>Staking Duration</label>
                        <p>{{stakingDurationText}}</p>
                    </div>
                    <div>
                        <label>Fee</label>
                        <p>{{feeText}} AVAX</p>
                    </div>
                    <div>
                        <label>Estimated Reward ({{((inflation-1)*100).toFixed(1)}}% Inflation)</label>
                        <p>{{estimatedReward}} AVAX</p>
                    </div>
                    <div>
                        <p class="err">{{err}}</p>
                        <v-btn v-if="!isConfirm" @click="confirm" class="button_secondary" depressed :loading="isLoading" :disabled="!canSubmit" block>Confirm</v-btn>
                        <template v-else>
                            <v-btn @click="submit" class="button_secondary" depressed :loading="isLoading" block>Submit</v-btn>
                            <v-btn text @click="cancelConfirm" block style="color:var(--primary-color); margin-top: 20px;">Cancel</v-btn>
                        </template>
                    </div>
                </div>
                <div v-else class="success_cont">
                    <p class="check"><fa icon="check-circle"></fa></p>
                    <h2>You are now delegating.</h2>
                    <p>Your tokens are locked for staking. You will receive your locked tokens plus the rewards once your staking period is over.</p>
                </div>
            </div>
        </div>


    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import {Vue, Component, Prop, Watch} from "vue-property-decorator";

import AvaxInput from '@/components/misc/AvaxInput.vue';
//@ts-ignore
import { QrInput } from "@avalabs/vue_components";
import ValidatorsList from "@/components/misc/ValidatorList/ValidatorsList.vue";
import {ValidatorRaw} from "@/components/misc/ValidatorList/types";
import StakingCalculator from "@/components/wallet/earn/StakingCalculator.vue";
import ConfirmPage from "@/components/wallet/earn/Delegate/ConfirmPage.vue";
import Big from 'big.js';
import moment from "moment";


import {BN} from 'avalanche';
import {PlatformVMConstants} from "avalanche/dist/apis/platformvm";
import {pChain} from "@/AVA";
import AvaHdWallet from "@/js/AvaHdWallet";
@Component({
    components: {
        AvaxInput,
        ValidatorsList,
        StakingCalculator,
        QrInput,
        ConfirmPage
    }
})
export default class AddDelegator extends Vue{
    search: string = "";
    selected: ValidatorRaw|null = null;
    stakeAmt: BN = new BN(0);
    startDate: string = '';
    endDate: string = '';
    rewardIn: string = "";
    rewardDestination = 'local'; // local || custom
    err: string = "";
    isLoading = false;
    isConfirm = false;
    isSuccess = false;
    txId = "";

    created(){
        this.startDate = this.startMinDate;
        this.endDate = this.endMaxDate;
    }

    onselect(val: ValidatorRaw){
        this.search = "";
        this.selected = val;
    }

    async submit(){
        if(!this.formCheck()){
            return;
        }

        this.isLoading = true;
        this.err = "";

        let nodeId = this.selected!.nodeID;
        let stakeAmt = this.stakeAmt;
        let start = new Date(this.startDate);
        let end = new Date(this.endDate);
        let rewardAddr = undefined;
        if(this.rewardDestination === 'custom'){
            rewardAddr = this.rewardIn;
        }

        let wallet: AvaHdWallet = this.$store.state.activeWallet;

        try{
            this.isLoading = false;
            let txId = await wallet.delegate(nodeId, stakeAmt, start, end, rewardAddr);
            this.onsuccess(txId);

        }catch(e){
            this.onerror(e);
            this.isLoading = false;

        }
    }

    onsuccess(txId: string){
        this.txId = txId;
        this.isSuccess = true;
        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Delegator Added',
            message: 'Your tokens will now be delegated for staking.'
        })
    }

    onerror(e: any){
        let msg:string = e.message;

        if(msg.includes('startTime')){
            this.err = "Start date must be in the future and end date must be after start date."
        }else if(msg.includes('address format')){
            this.err = "Invalid address format. Your address must start with \"P-\"";
        }else{
            this.err = e.message;
        }
        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Delegation Failed',
            message: 'Failed to delegate tokens.'
        })
    }

    onStartChange(val: any){
        this.startDate = val;
    }
    onEndChange(val: any){
        this.endDate = val;
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

    rewardSelect(val: 'local'|'custom'){
        if(val==='local'){
            this.rewardIn = this.rewardAddressLocal;
        }else{
            this.rewardIn = "";
        }
        this.rewardDestination = val;
    }

    get rewardAddressLocal(){
        let wallet: AvaHdWallet = this.$store.state.activeWallet;
        return wallet.getPlatformRewardAddress();
    }

    formCheck(): boolean{
        this.err = "";

        if(!this.selected){
            this.err = "You must specify a validator."
            return false;
        }

        // let minStakeAmt = this.minStake;
        // if(this.stakeAmt.lt(minStakeAmt)){
        //     let big = Big(minStakeAmt.toString()).div(Math.pow(10,9));
        //     this.err = `Minimum staking amount is ${big.toLocaleString(0)} AVAX`;
        //     return false;
        // }

        let startTime = (new Date(this.startDate)).getTime();
        let endTime = (new Date(this.endDate)).getTime();
        let now = Date.now();
        let diffTime = endTime-startTime;
        let dur24 = (60000*60*24);
        let durYear = dur24*365;


        if(startTime <= now){
            this.err = `Start time must be after current time.`;
            return false;
        }

        if(diffTime < dur24){
            this.err = `Minimum staking duration is 24 hours.`;
            return false;
        }

        if(diffTime > durYear){
            this.err = `Maximum staking duration is 1 year.`;
            return false;
        }

        let validatorEndtime = parseInt(this.selected.endTime)*1000;

        if(endTime > validatorEndtime){
            this.err = `Delegation end date can not be longer than the validator's end date.`;
            return false;
        }

        // Reward address check
        if(this.rewardDestination!='local' && !this.rewardIn){
            this.err = "You must give an address to receive delegation rewards."
            return false;
        }


        return true;
    }

    confirm(){
        if(!this.formCheck()) return;
        this.isConfirm = true;
    }
    cancelConfirm(){
        this.isConfirm = false;
    }

    get canSubmit(): boolean{
        if(this.stakeAmt.isZero()){
            return false;
        }
        return true
    }

    // ISOS string
    // Earliest date is now + 5min.
    get startMinDate(): string{
        let now = Date.now();
        let res = now + (60000 * 5);

        return (new Date(res)).toISOString();
    }

    // Max date is end time -1 day
    get startMaxDate(): string{
        if(!this.selected) return (new Date()).toISOString();
        let nodeEndTime = parseInt(this.selected.endTime);
            nodeEndTime = nodeEndTime*1000;

        let nodeEndDate = new Date(nodeEndTime - (1000*60*60*24));
        return nodeEndDate.toISOString()
    }

    get endMinDate(): string{
        let startDate = new Date(this.startDate);
        let endTime = startDate.getTime() + (1000 * 60 * 60 * 24);
        let endDate = new Date(endTime);
        return endDate.toISOString();
    }

    get endMaxDate(): string{
        if(!this.selected) return (new Date()).toISOString();

        let nodeEndTime = parseInt(this.selected.endTime) * 1000;
            nodeEndTime -= 60000;
        return (new Date(nodeEndTime)).toISOString();
    }

    get stakingDuration(): number{
        let start = new Date(this.startDate);
        let end = new Date(this.endDate);
        let dur = end.getTime() - start.getTime()
        return dur;
    }

    @Watch('stakingDuration')
    durChange(val: number){
        if(val < (60000*60*24)){
            this.endDate = this.endMinDate;
        }
    }

    @Watch('selected')
    onValidatorChange(val: ValidatorRaw){
        this.endDate = this.endMinDate;
    }

    get stakingDurationText(): string{
        let dur = this.stakingDuration;
        let d = moment.duration(dur, 'milliseconds')
        // return d.humanize()
        let days = Math.floor(d.asDays());
        return `${days} days ${d.hours()} hours ${d.minutes()} minutes`;
    }

    get minStake(): BN{
        return  PlatformVMConstants.MINSTAKE;
    }

    get fee(): BN{
        return  pChain.getFee();
    }

    get feeText(): string{
        let amt = this.fee;
        let big = Big(amt.toString()).div(Math.pow(10,9));
        return big.toString()
    }

    get minAmt(): BN{
        return this.minStake.add(this.fee)
    }

    get maxAmt(): BN{
        let zero = new BN(0);

        let max = this.platformUnlocked.sub(this.fee)

        if(zero.gt(max)) return zero;
        return max;
    }

    get stakeAmtText(){
        let amt = this.stakeAmt;
        let big = Big(amt.toString()).div(Math.pow(10,9));

        if(big.lte(Big('0.0001'))){
            return big.toLocaleString(9)
        }
        return big.toLocaleString(2)
    }

    get platformUnlocked(): BN{
        return this.$store.getters.walletPlatformBalance;
    }
}
</script>
<style scoped lang="scss">
@use "../../../../main";

.val_list{
    overflow: scroll;
    max-height: 450px;
    margin-top: 14px;
}
.cols{
    display: grid;
    grid-template-columns: 1fr 340px;
    column-gap: 90px;
}

form{
    width: 100%;
}

.search{
    padding: 3px 12px;
    border-radius: 12px;
    background-color: var(--bg-light);
    margin-left: 30px;
    color: var(--primary-color);
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
.selected{
    display: grid;
    width: max-content;
    grid-template-columns: 40px 1fr;
    background-color: var(--bg-light);
    border-radius: 6px;
    padding: 4px 0;
    padding-right: 14px;

    button{
        opacity: 0.4;
        &:hover{
            opacity: 1;
        }
    }
}

.amt_in{
    width: max-content;
}

.dates{
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;
}


/*.amt_in{*/
/*    background-color: var(--bg-light);*/
/*    color: var(--primary-color);*/
/*    padding: 8px 14px;*/
/*    width: 100%;*/
/*}*/

.reward_in{
    transition-duration: 0.2s;
    &[type="local"]{
        .reward_addr_in{
            opacity: 0.3;
            user-select: none;
            cursor: not-allowed;
            pointer-events: none;
            width: 100%;
            height: 40px;
            border-radius: 2px;
        }
    }
}

.desc{
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
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

@include main.mobile-device{
    .cols{
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
