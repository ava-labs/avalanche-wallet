<template>
    <div class="reward_row">
        <div class="reward_bar_cont">
            <div class="reward_bar" :style="{
                width: `${percFull*100}%`
            }"></div>
            <div class="date">
                <label>Start</label>
                <p >{{startDate.toLocaleString()}}</p>
            </div>
            <p>{{(percFull*100).toFixed(2)}}%</p>
            <div class="date">
                <label>End</label>
                <p>{{endDate.toLocaleString()}}</p>
            </div>
        </div>
        <div class="stake_info">
            <div>
                <label>Stake</label>
                <p class="reward">{{stakeBig.toLocaleString()}} AVAX</p>
            </div>
            <div>
                <label>Potential Reward</label>
                <p class="reward">{{rewardBig.toLocaleString()}} AVAX</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import {DelegatorRaw, ValidatorRaw} from "../../misc/ValidatorList/types";
import {BN} from "avalanche";
import Big from "big.js";

@Component
export default class UserRewardRow extends Vue{
    now: number = Date.now();
    intervalID: any = null;

    @Prop() staker!: ValidatorRaw|DelegatorRaw;

    updateNow(){
        this.now = Date.now();
    }

    created(){
        this.intervalID = setInterval(()=>{
            this.updateNow()
        }, 2000);
    }
    destroyed(){
        clearInterval(this.intervalID);
    }
    get startTime(){
        return parseInt(this.staker.startTime) * 1000;
    }

    get endtime(){
        return parseInt(this.staker.endTime) * 1000;
    }

    get startDate(){
        return new Date(this.startTime);
    }

    get endDate(){
        return new Date(this.endtime);
    }

    get rewardAmt(): BN{
        return new BN(this.staker.potentialReward);
    }

    get stakingAmt(): BN{
        return new BN(this.staker.stakeAmount);
    }

    get rewardBig(): Big{
        return Big(this.rewardAmt.toString()).div(Math.pow(10,9));
    }

    get stakeBig(): Big{
        return Big(this.stakingAmt.toString()).div(Math.pow(10,9));
    }

    get percFull(): number{
        let range = this.endtime - this.startTime;
        let res = (this.now - this.startTime)/range;
        return Math.min(res,1);
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.reward_row{
    display: grid;
    grid-template-columns: 1fr 280px;
    align-items: center;
    background-color: var(--bg-light);
    border-radius: 4px;
    overflow: hidden;
    font-size: 14px;
    border: 2px solid var(--bg-light);
}
.reward_bar_cont{
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px;
    height: 100%;
    //background-color: rgba(0,0,0,0.1);

    p{
        z-index: 1;
    }

    label{
        color: var(--primary-color);
    }
}

.date{
    z-index: 1;
}
.reward_bar{
    background-color: var(--success);
    position: absolute;
    opacity: 0.5;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;
}

.stake_info{
    padding: 4px 12px;
    text-align: right;
    display: grid;
    grid-template-rows: max-content max-content;
    //grid-template-columns: 1fr 1fr;
    border-left: 3px solid var(--bg);
}

label{
    color: var(--primary-color-light);
}

@include main.mobile-device{
    .reward_bar_cont{
        grid-column: 1/3;
    }

    .stake_info{
        grid-column: 1/3;
        border-left: none;
        border-top: 3px solid var(--bg);

        > div:first-of-type{
            text-align: left;
        }
    }
}
</style>
