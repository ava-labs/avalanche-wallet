<template>
    <div>
        <div v-if="!selected">
            <div style="display: flex; align-items: center">
                <p>Select a node to delegate:</p>
                <input class="search" type="text" placeholder="Search Node ID" v-model="search">
            </div>
            <ValidatorsList class="val_list" :search="search" @select="onselect"></ValidatorsList>
        </div>
        <div v-else class="form">
            <form @submit.prevent="">
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
                        <label>Start Date & Time</label>
                        <datetime v-model="startDate" type="datetime" :min-datetime="startMinDate" :max-datetime="startMaxDate"></datetime>
                        <label>End Date & Time</label>
                        <datetime v-model="endDate" type="datetime" :min-datetime="endMinDate" :max-datetime="endMaxDate"></datetime>
                    </div>
                </div>
                <div style="margin: 30px 0;">
                    <h4>Stake Amount</h4>
                    <p class="desc">The amount of AVAX to lock for staking.</p>
                    <AvaxInput v-model="stakeAmt" :max="maxAmt"></AvaxInput>
                </div>
                <div style="margin: 30px 0;">
                    <h4>Reward Address</h4>
                    <p class="desc">Where to send the staking rewards.</p>
                    <v-chip-group mandatory @change="rewardSelect">
                        <v-chip small value="local">Use this wallet</v-chip>
                        <v-chip small value="custom">Custom Address</v-chip>
                    </v-chip-group>
                    <QrInput style="height: 40px; border-radius: 2px;" v-model="rewardIn" v-if="rewardDestination==='custom'" placeholder="Reward Address"></QrInput>
                </div>
            </form>
            <div class="calculator">
                <label>Staking Duration</label>
                <p>{{stakingDurationText}}</p>
                <div>
                    <label>Stake Amount</label>
                    <p>{{stakeAmtText}} AVAX</p>
                </div>
                <div>
                    <label>Fee</label>
                    <p>{{feeText}} AVAX</p>
                </div>
                <p class="err">{{err}}</p>
                <v-btn @click="submit" class="button_secondary" depressed :loading="isLoading">Submit</v-btn>
            </div>


<!--            <v-text-field label="Selected Node" :value="selected.nodeID" disabled></v-text-field>-->
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

    created(){
        this.startDate = this.startMinDate;
        this.endDate = this.endMaxDate;
    }

    onselect(val: ValidatorRaw){
        this.search = "";
        this.selected = val;
    }

    async submit(){
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
            console.log(txId);
            this.$store.dispatch('Notifications/add', {
                type: 'success',
                title: 'Delegator Added',
                message: 'Your tokens will now be delegated for staking.'
            })
        }catch(e){
            this.isLoading = false;
            let msg:string = e.message;

            if(msg.includes('startTime')){
                this.err = "Start date must be in the future and end date must be after start date."
            }else{
                this.err = e.message;
            }
            this.$store.dispatch('Notifications/add', {
                type: 'error',
                title: 'Delegation Failed',
                message: 'Failed to delegate tokens.'
            })
        }
    }

    onStartChange(val: any){
        this.startDate = val;
    }
    onEndChange(val: any){
        this.endDate = val;
    }

    rewardSelect(val: 'local'|'custom'){
        this.rewardDestination = val;
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
        let nodeEndTime = parseInt(this.selected.endTime);
            nodeEndTime = nodeEndTime*1000;
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
.val_list{
    overflow: scroll;
    max-height: 450px;
    margin-top: 14px;
}

.form{
    display: grid;
    grid-template-columns: 1fr 1fr;
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

.dates{
    display: grid;
}

form{
    width: max-content;
}

.amt_in{
    background-color: var(--bg-light);
    color: var(--primary-color);
    padding: 8px 14px;
    width: 100%;
}

.desc{
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
}

.calculator{
    //text-align: right;
    padding-left: 30px;
    label{
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    p{
        font-size: 24px;
    }
}


</style>
