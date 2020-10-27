<template>
    <div class="add_delegator">
            <NodeSelection v-if="!selected" @select="onselect" class="node_selection"></NodeSelection>
        <div class="cols" v-else>
            <transition-group name="fade" mode="out-in">
                <div class="ins_col" key="form" v-show="!isConfirm">
                    <div>
                        <div class="selected">
                            <button @click="selected = null" class="close_but">
                                <fa icon="times"></fa>
                            </button>
                            <div class="id_box">
                                <p style="font-size: 13px; color: var(--primary-color-light)">{{$t('earn.delegate.node.selected')}}</p>
                                <p class="node_id" style="word-break: break-all;">{{selected.nodeID}}</p>
                            </div>
                            <div>
                                <p style="font-size: 13px; color: var(--primary-color-light)">{{$t('earn.delegate.node.fee')}}</p>
                                <p class="node_id">{{delegationFee}} %</p>
                            </div>
                            <div>
                                <p style="font-size: 13px; color: var(--primary-color-light)">{{$t('earn.delegate.node.start')}}</p>
                                <p class="node_id">{{selected.startTime.toLocaleString()}}</p>
                            </div>
                            <div>
                                <p style="font-size: 13px; color: var(--primary-color-light)">{{$t('earn.delegate.node.end')}}</p>
                                <p class="node_id">{{selected.endTime.toLocaleString()}}</p>
                            </div>
                        </div>
                        <div style="margin: 30px 0;">
                            <h4>{{$t('earn.delegate.form.period.label')}}</h4>
                            <p class="desc">{{$t('earn.delegate.form.period.desc')}}</p>
                            <div class="dates">
                                <div>
                                    <label>{{$t('earn.delegate.form.period.start')}}</label>
                                    <datetime v-model="startDate" type="datetime" :min-datetime="startMinDate" :max-datetime="startMaxDate"></datetime>
                                </div>
                                <div>
                                    <label>{{$t('earn.delegate.form.period.end')}} <span @click="maxoutEndDate">Max</span></label>
                                    <datetime v-model="endDate" type="datetime" :min-datetime="endMinDate" :max-datetime="endMaxDate"></datetime>
                                </div>

                            </div>
                        </div>
                        <div style="margin: 30px 0;">
                            <h4>{{$t('earn.delegate.form.amount.label')}}</h4>
                            <p class="desc">{{$t('earn.delegate.form.amount.desc')}}</p>
                            <p class="desc">{{$t('earn.delegate.form.amount.desc2', [remainingAmtText])}}</p>
                            <AvaxInput v-model="stakeAmt" :max="maxAmt" class="amt_in"></AvaxInput>
                        </div>
                        <div class="reward_in" style="margin: 30px 0;"  :type="rewardDestination">
                            <h4>{{$t('earn.delegate.form.reward.label')}}</h4>
                            <p class="desc">{{$t('earn.delegate.form.reward.desc')}}</p>
                            <v-chip-group mandatory @change="rewardSelect">
                                <v-chip small value="local">{{$t('earn.delegate.form.reward.chip_1')}}</v-chip>
                                <v-chip small value="custom">{{$t('earn.delegate.form.reward.chip_2')}}</v-chip>
                            </v-chip-group>
                            <QrInput  v-model="rewardIn" placeholder="Reward Address" class="reward_addr_in"></QrInput>
                        </div>
                    </div>
                </div>
                <ConfirmPage v-show="isConfirm" key="confirm" :start="formStart" :end="formEnd" :amount="formAmt" :reward-destination="rewardDestination" :reward-address="formRewardAddr" :node-i-d="formNodeID"></ConfirmPage>
            </transition-group>
            <div>
                <div v-if="!isSuccess" class="summary">
                    <CurrencySelect v-model="currency_type"></CurrencySelect>
                    <div>
                        <label>{{$t('earn.delegate.summary.duration')}} *</label>
                        <p>{{stakingDurationText}}</p>
                    </div>
                    <div>
                        <label>{{$t('earn.delegate.summary.reward')}}</label>
                        <p v-if="currency_type==='AVAX'">{{estimatedReward.toLocaleString(2)}} AVAX</p>
                        <p v-if="currency_type==='USD'">${{estimatedRewardUSD.toLocaleString(2)}} USD</p>
                    </div>
                    <div>
                        <label>{{$t('earn.delegate.summary.fee')}}</label>
                        <p v-if="currency_type==='AVAX'">{{totalFeeBig.toLocaleString(2)}} AVAX</p>
                        <p v-if="currency_type==='USD'">${{totalFeeUsdBig.toLocaleString(2)}} USD</p>
                    </div>

                    <div>
                        <label style="margin: 8px 0 !important;">* {{$t('earn.delegate.summary.warn')}}</label>
                        <p class="err">{{err}}</p>
                        <v-btn v-if="!isConfirm" @click="confirm" class="button_secondary" depressed :loading="isLoading" :disabled="!canSubmit" block>{{$t('earn.delegate.confirm')}}</v-btn>
                        <template v-else>
                            <v-btn @click="submit" class="button_secondary" depressed :loading="isLoading" block>{{$t('earn.delegate.submit')}}</v-btn>
                            <v-btn text @click="cancelConfirm" block style="color:var(--primary-color); margin-top: 20px;">{{$t('earn.delegate.cancel')}}</v-btn>
                        </template>
                    </div>
                </div>
                <div v-else class="success_cont">
                    <p class="check"><fa icon="check-circle"></fa></p>
                    <h2>{{$t('earn.delegate.success.title')}}</h2>
                    <p>{{$t('earn.delegate.success.desc')}}</p>
                    <p class="tx_id">Tx ID: {{txId}}</p>
                    <div class="tx_status">
                        <label>{{$t('earn.delegate.success.status')}}</label>
                        <p v-if="!txStatus">Waiting..</p>
                        <p v-else>{{txStatus}}</p>
                    </div>
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
import {ava, avm, bintools, infoApi, pChain} from "@/AVA";
import AvaHdWallet from "@/js/wallets/AvaHdWallet";
import {bnToBig, calculateStakingReward} from "@/helpers/helper";
import {Defaults, ONEAVAX} from "avalanche/dist/utils";
import {ValidatorListItem} from "@/store/modules/platform/types";
import NodeSelection from "@/components/wallet/earn/Delegate/NodeSelection.vue";
import CurrencySelect from "@/components/misc/CurrencySelect/CurrencySelect.vue";

const MIN_MS = 60000;
const HOUR_MS = MIN_MS * 60;
const DAY_MS = HOUR_MS * 24;


@Component({
    components: {
        CurrencySelect,
        NodeSelection,
        AvaxInput,
        ValidatorsList,
        StakingCalculator,
        QrInput,
        ConfirmPage
    }
})
export default class AddDelegator extends Vue{
    search: string = "";
    selected: ValidatorListItem|null = null;
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
    txStatus = "";

    formNodeID = "";
    formAmt = new BN(0);
    formStart: Date = new Date(this.startMinDate);
    formEnd: Date = new Date(this.endMaxDate);
    formRewardAddr = "";

    currency_type = "AVAX";


    created(){
        this.startDate = this.startMinDate;
        this.endDate = this.endMaxDate;

        // avm.
    }

    onselect(val: ValidatorListItem){
        this.search = "";
        this.selected = val;
    }

    async submit(){
        if(!this.formCheck()){
            return;
        }

        this.isLoading = true;
        this.err = "";

        let wallet: AvaHdWallet = this.$store.state.activeWallet;

        try{
            this.isLoading = false;
            let txId = await wallet.delegate(this.formNodeID, this.formAmt, this.formStart, this.formEnd, this.formRewardAddr);
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

        this.updateTxStatus(txId);
    }

    async updateTxStatus(txId: string){
        let status = await pChain.getTxStatus(txId);

        if(!status || status==='Processing'){
            setTimeout(() => {
                this.updateTxStatus(txId);
            }, 5000);
        }else{
            this.txStatus = status;
        }
    }

    onerror(e: any){
        console.error(e);
        let msg:string = e.message;

        if(msg.includes('startTime')){
            this.err = this.$t('earn.delegate.errs.start_end') as string;
            // this.err = "Start date must be in the future and end date must be after start date."
        }else if(msg.includes('address format')){
            this.err = this.$t('earn.delegate.errs.invalid_addr') as string
            // this.err = "Invalid address format. Your address must start with \"P-\"";
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

    get estimatedReward(): Big{
        let start = new Date(this.startDate);
        let end = new Date(this.endDate);
        let duration = end.getTime() - start.getTime(); // in ms

        let currentSupply = this.$store.state.Platform.currentSupply;

        let estimation = calculateStakingReward(this.stakeAmt,duration/1000, currentSupply)
        let res = Big(estimation.toString()).div(Math.pow(10,9));
        return res;
    }

    get estimatedRewardUSD(){
        return this.estimatedReward.times(this.avaxPrice);
    }

    get avaxPrice(): Big{
        return Big(this.$store.state.prices.usd);
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
            this.err = this.$t('earn.delegate.errs.no_node') as string;
            // this.err = "You must specify a validator."
            return false;
        }

        let startTime = (new Date(this.startDate)).getTime();
        let endTime = (new Date(this.endDate)).getTime();
        let now = Date.now();
        let diffTime = endTime-startTime;


        if(startTime <= now){
            this.err = this.$t('earn.delegate.errs.start_now') as string;
            // this.err = `Start time must be after current time.`;
            return false;
        }

        // TODO: UPDATE THIS WITH REAL VALUE
        if(diffTime < DAY_MS*14){
            this.err = this.$t('earn.delegate.errs.min_dur') as string;
            // this.err = `Minimum staking duration is 2 weeks.`;
            return false;
        }

        if(diffTime > DAY_MS*365){
            this.err = this.$t('earn.delegate.errs.max_dur') as string;
            // this.err = `Maximum staking duration is 1 year.`;
            return false;
        }

        let validatorEndtime = this.selected.endTime.getTime();

        if(endTime > validatorEndtime){
            this.err = this.$t('earn.delegate.errs.val_end') as string;
            // this.err = `Delegation end date can not be longer than the validator's end date.`;
            return false;
        }

        // Reward address check
        if(this.rewardDestination!='local' && !this.rewardIn){
            this.err = this.$t('earn.delegate.errs.no_addr') as string;
            // this.err = "You must give an address to receive delegation rewards."
            return false;
        }

        // Validate reward address
        try{
            bintools.stringToAddress(this.rewardIn)
        }catch (e){
            this.err =  this.$t('earn.delegate.errs.invalid_addr') as string;
            // this.err = "Invalid reward address."
            return false;
        }


        // Stake amount check
        if(this.stakeAmt.lt(this.minStake)){
            let big = bnToBig(this.minStake,9);
            this.err = this.$t('earn.delegate.errs.amt', [big.toLocaleString()]) as string;
            // this.err = `Delegation amount must be at least ${big.toLocaleString()} AVAX.`
            return false;
        }

        return true;
    }

    updateFormData(){
        this.formNodeID = this.selected!.nodeID;
        this.formAmt = this.stakeAmt;
        this.formStart = new Date(this.startDate);
        this.formEnd = new Date(this.endDate);
        this.formRewardAddr = this.rewardIn;
    }


    confirm(){
        if(!this.formCheck()) return;
        this.updateFormData();
        this.isConfirm = true;
    }

    cancelConfirm(){
        this.isConfirm = false;
    }

    maxoutEndDate(){
        this.endDate = this.endMaxDate;
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
        // let nodeEndTime = parseInt(this.selected.endTime);
        //     nodeEndTime = nodeEndTime*1000;

        let nodeEndTime = this.selected.endTime.getTime();

        let nodeEndDate = new Date(nodeEndTime - (1000*60*60*24));
        return nodeEndDate.toISOString()
    }

    // minimum end date is start date + 2 weeks
    get endMinDate(): string{
        let startDate = new Date(this.startDate);
        let endTime = startDate.getTime() + (DAY_MS*14);
        // let endTime = startDate.getTime();
        let endDate = new Date(endTime);
        return endDate.toISOString();
    }

    // Maximum end date is end of validator's staking duration
    get endMaxDate(): string{
        if(!this.selected) return (new Date()).toISOString();

        // let nodeEndTime = parseInt(this.selected.endTime) * 1000;
        let nodeEndTime = this.selected.endTime.getTime();
            nodeEndTime -= 60000;
        return (new Date(nodeEndTime)).toISOString();
    }

    get stakingDuration(): number{
        let start = new Date(this.startDate);
        let end = new Date(this.endDate);
        let dur = end.getTime() - start.getTime()
        return dur;
    }

    //TODO: UNDO
    @Watch('stakingDuration')
    durChange(val: number){
        if(val < (DAY_MS*14)){
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
        return  this.$store.state.Platform.minStakeDelegation;
    }


    get delegationFee(): number{
        if(!this.selected) return 0;
        return  this.selected.fee;
    }

    get totalFee(): BN{
        let delegationFee = Big(this.delegationFee).div(Big(100));
        let cut = this.estimatedReward.times(delegationFee)

        let txFee:BN = pChain.getTxFee();
        let cutBN = new BN(cut.times(Math.pow(10,9)).toFixed(0))
        let totFee = txFee.add(cutBN);
        return  totFee;
    }

    get totalFeeBig(){
        return bnToBig(this.totalFee, 9);
    }

    get totalFeeUsdBig(){
        return this.totalFeeBig.times(this.avaxPrice);
    }

    get txFee(): BN{
        return pChain.getTxFee();
    }

    get txFeeBig(): Big{
        return bnToBig(this.txFee, 9);
    }

    get feeText(): string{
        let big = this.totalFeeBig;
        return big.toLocaleString(0)
    }

    get minAmt(): BN{
        return this.minStake.add(this.txFee)
    }

    get remainingAmt(): BN{
        if(!this.selected) return new BN(0);
        // let totDel: BN = this.$store.getters["Platform/validatorTotalDelegated"](this.selected.nodeID);
        let nodeMaxStake: BN = this.$store.getters["Platform/validatorMaxStake"](this.selected);

        let totDel = this.selected.delegatedStake;
        let valAmt = this.selected.validatorStake;
        return nodeMaxStake.sub(totDel).sub(valAmt)
    }

    get remainingAmtText(){
        let bn = this.remainingAmt;
        return bnToBig(bn,9).toLocaleString();
    }

    get maxAmt(): BN{
        let zero = new BN(0);

        let totAvailable = this.platformUnlocked.add(this.platformLockedStakeable);
        // let max = totAvailable.sub(this.txFee)

        if(zero.gt(totAvailable)) return zero;

        if(totAvailable.gt(this.remainingAmt)) return this.remainingAmt;

        return totAvailable;
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

    get platformLockedStakeable(): BN{
        return this.$store.getters.walletPlatformBalanceLockedStakeable;
    }
}
</script>
<style scoped lang="scss">
@use "../../../../main";

.add_delegator{
    height: 100%;
}

.node_selection{
    height: 100%;
}

.cols{
    display: grid;
    grid-template-columns: 1fr 340px;
    column-gap: 2vw;
}

form{
    width: 100%;
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
    display: flex;
    flex-wrap: wrap;
    //width: max-content;
    //display: grid;
    position: relative;
    grid-template-columns: max-content max-content max-content;
    column-gap: 14px;
    background-color: var(--bg-light);
    border-radius: 6px;
    padding: 4px 0;
    padding-left: 34px;
    padding-right: 14px;

    .id_box{
        //grid-column: 1/3;
    }
    .close_but{
        position: absolute;
        top: 6px;
        left: 12px;
    }

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
    //display: grid;
    //grid-template-columns: 1fr 1fr;
    //grid-gap: 15px;
    display: flex;
    >div{
        margin-right: 15px;
    }

    label > span{
        float: right;
        opacity: 0.4;
        cursor: pointer;
        &:hover{
            opacity: 1;
        }
    }
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

    .v-btn{
        margin-top: 14px;
    }
}

.success_cont{
    .check{
        font-size: 4em;
        color: var(--success);
    }

    .tx_id{
        font-size: 13px;
        color: var(--primary-color-light);
        word-break: break-all;
        margin: 14px 0 !important;
        font-weight: bold;
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
